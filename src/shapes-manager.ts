import { StandardMaterial, Mesh } from "babylonjs";
import { Editor, Tools } from "babylonjs-editor";

export class ShapesManager {
    private _editor: Editor;
    private _material: StandardMaterial;

    /**
     * Constructor.
     * @param editor defines the reference to the editor.
     */
    public constructor(editor: Editor) {
        this._editor = editor;

        this._createMaterial();
    }

    /**
     * Adds a new cube shape.
     * @param name defines the name of the shape.
     */
    public addCubeShape(name: string): Mesh {
        return this._configureShape(Mesh.CreateBox(name, 1, this._editor.scene!), "cube");
    }

    /**
     * Adds a new sphere shape.
     * @param name defines the name of the shape.
     */
    public addSphereShape(name: string): Mesh {
        return this._configureShape(Mesh.CreateSphere(name, 4, 1, this._editor.scene!), "sphere");
    }

    /**
     * Sets the metadata of the new shape created.
     */
    private _configureShape(mesh: Mesh, shapeType: "cube" | "sphere"): Mesh {
        // Assign id for the shape
        mesh.id = Tools.RandomId();
        mesh.material = this._material;
        mesh.doNotSerialize = true;

        // Configure metadata of the shape
        const metadata = Tools.GetMeshMetadata(mesh);
        metadata.editorGraphStyles = {
            fontStyle: "italic",
            color: "darkgoldenrod",
        };
        metadata.box2d = {
            shapeType,
        };

        return mesh;
    }

    /**
     * Creates the material used to render shapes.
     */
    private _createMaterial(): void {
        this._material = new StandardMaterial("box2d_shapes", this._editor.scene!);
        this._material.disableLighting = true;
        this._material.wireframe = true;
        this._material.doNotSerialize = true;
    }
}
