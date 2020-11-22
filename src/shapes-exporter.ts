import { pathExists, mkdir, writeJSON, readJSON } from "fs-extra";
import { join, basename, normalize } from "path";
import filenamify from "filenamify";

import { AbstractMesh, Vector3 } from "babylonjs";

import { Editor, Project, ProjectExporter } from "babylonjs-editor";
import { Nullable, Undefinable } from "babylonjs-editor/shared/types";

import { ShapesManager } from "./shapes-manager";
import { IExportedShape } from "./types";

export class ShapesExporter {
    private static _ProjectConfigurationName: string = "project.box2d.json";
    
    private _editor: Editor;
    private _shapesManager: ShapesManager;

    /**
     * Constructor.
     * @param editor defines the editor reference.
     * @param shapesManager defines the reference to the shapes manager.
     */
    public constructor(editor: Editor, shapesManager: ShapesManager) {
        this._editor = editor;
        this._shapesManager = shapesManager;
    }

    /**
     * Initializes the shapes exporter.
     */
    public init(): void {
        // Load project
        if (this._editor.isInitialized) {
            this._loadProject(Project.DirPath)
        } else {
            this._editor.editorInitializedObservable.addOnce(() => this._loadProject(Project.DirPath));
        }

        // Save
        this._editor.afterSaveProjectObservable.add((projectDir) => this._saveProject(projectDir));

        // Generate
        this._editor.afterGenerateSceneObservable.add((sceneDir) => this._generateScene(sceneDir));
    }

    /**
     * Disposes the shapes exporter.
     */
    public dispose(): void {
        // Dispose all shapes
        let shape: Undefinable<AbstractMesh>;
        while ((shape = this._editor.scene!.meshes.find((m) => m.metadata?.box2d))) {
            shape.dispose(true, true);
        }

        this._editor.graph.refresh();
    }

    /**
     * Called on the project has been loaded;
     */
    private async _loadProject(projectDir: Nullable<string>): Promise<void> {
        if (!projectDir) { return; }
        
        const box2dPath = join(projectDir, "box2d");

        // Check directory exists
        const directoryExists = await pathExists(box2dPath);
        if (!directoryExists) { return; }

        // load project files
        const shapeFiles = await readJSON(join(box2dPath, ShapesExporter._ProjectConfigurationName), { encoding: "utf-8" }) as string[];
        for (const shapeFile of shapeFiles) {
            const shapeJson = await readJSON(join(box2dPath, shapeFile), { encoding: "utf-8" }) as IExportedShape;

            let shapeMesh: Nullable<AbstractMesh> = null;
            switch (shapeJson.type) {
                case "cube": shapeMesh = this._shapesManager.addCubeShape(shapeJson.name); break;
                case "sphere": shapeMesh = this._shapesManager.addSphereShape(shapeJson.name); break;
            }

            if (shapeMesh) {
                shapeMesh.id = shapeJson.id;
                shapeMesh.position = Vector3.FromArray(shapeJson.position);
                shapeMesh.rotation = Vector3.FromArray(shapeJson.rotation);
                shapeMesh.scaling = Vector3.FromArray(shapeJson.scaling);

                this._editor.addedNodeObservable.notifyObservers(shapeMesh);
            }
        }

        this._editor.notifyMessage("Box2D configuration successfully loaded");
        this._editor.graph.refresh();
    }

    /**
     * Called on the project has been saved, creates a custom directory for the plugin and saves
     * the JSON files.
     */
    private async _saveProject(projectDir: string): Promise<void> {
        const box2dPath = join(projectDir, "box2d");

        // Check directory exists
        const directoryExists = await pathExists(box2dPath);
        if (!directoryExists) { await mkdir(box2dPath); }

        // Keep list of all saved files
        const savedFiles: string[] = [];

        // Export json files
        for (const mesh of this._editor.scene!.meshes) {
            if (!mesh.metadata?.box2d) { continue; }

            const shapeFilename = `${normalize(`${basename(filenamify(mesh.name))}-${mesh.id}`)}.json`;
            const shapeJson = this._convertShapeAsJson(mesh);

            try {
                await writeJSON(join(box2dPath, shapeFilename), shapeJson, {
                    encoding: "utf-8",
                    spaces: "\t",
                });

                savedFiles.push(shapeFilename);
            } catch (e) {
                this._editor.console.logError(`Failed to save box2d shape at path: "${shapeFilename}"`);
            }
        }

        await writeJSON(join(box2dPath, ShapesExporter._ProjectConfigurationName), savedFiles, {
            encoding: "utf-8",
            spaces: "\t",
        });

        savedFiles.push(ShapesExporter._ProjectConfigurationName);
        ProjectExporter._CleanOutputDir(box2dPath, savedFiles);

        this._editor.notifyMessage("Box2D configuration successfully saved.");
    }

    /**
     * Called on the scene has been generated. Will save the full JSON containg the shapes
     * in the scene.
     */
    private async _generateScene(sceneDir: string): Promise<void> {
        const shapesJson: IExportedShape[] = [];
        for (const mesh of this._editor.scene!.meshes) {
            if (!mesh.metadata?.box2d) { continue; }
            shapesJson.push(this._convertShapeAsJson(mesh));
        }

        await writeJSON(join(sceneDir, "box2d.json"), shapesJson, { encoding: "utf-8" });
        this._editor.notifyMessage("Box2D configuration successfully generated.");
    }

    /**
     * Converts the given shape mesh as JSON.
     */
    private _convertShapeAsJson(shape: AbstractMesh): IExportedShape {
        return {
            name: shape.name,
            id: shape.id,
            type: shape.metadata.box2d.shapeType,
            position: shape.position.asArray(),
            rotation: shape.rotation.asArray(),
            scaling: shape.scaling.asArray(),
        }
    }
}
