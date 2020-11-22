import * as React from "react";
import { Menu, MenuItem, MenuDivider } from "@blueprintjs/core";

import { Nullable, Mesh } from "babylonjs";
import { Dialog, Editor, ProjectExporter } from "babylonjs-editor";

import { ShapesManager } from "./shapes-manager";

export interface IToolbarProps {
    /**
     * Defines the reference to the editor.
     */
    editor: Editor;
    /**
     * Defines the reference to the shapes manager.
     */
    shapesManager: ShapesManager;
}

export class Toolbar extends React.Component<IToolbarProps> {
    /**
     * Renders the component.
     */
    public render(): React.ReactNode {
        return (
            <Menu>
                <MenuItem text="Add" icon="add">
                    <MenuItem text="Cube..." icon="export" onClick={() => this._handleAddShape("cube")} />
                    <MenuItem text="Sphere..." icon="export" onClick={() => this._handleAddShape("sphere")} />
                </MenuItem>
                <MenuDivider />
                <MenuItem text="Export Project..." icon="export" onClick={() => this._handleExportProject()} />
                <MenuItem text="Generate Scene..." icon="export" onClick={() => this._handleGenerateScene()} />
            </Menu>
        );
    }

    /**
     * Called on the user wants to add a new shape.
     */
    private async _handleAddShape(shape: "cube" | "sphere"): Promise<void> {
        const name = await Dialog.Show("Shape Name?", "Please provide a name for the new shape");
        let node: Nullable<Mesh> = null;

        switch (shape) {
            case "cube": node = this.props.shapesManager.addCubeShape(name); break;
            case "sphere": node = this.props.shapesManager.addSphereShape(name); break;
        }

        if (node) {
            this.props.editor.addedNodeObservable.notifyObservers(node);
            this.props.editor.graph.refreshAndSelect(node);
        }
    }

    /**
     * Called on the user wants to export the project.
     */
    private async _handleExportProject(): Promise<void> {
        await ProjectExporter.Save(this.props.editor, false);
    }

    /**
     * Called on the user wants to generate the scene.
     */
    private async _handleGenerateScene(): Promise<void> {
        await ProjectExporter.ExportFinalScene(this.props.editor);
    }
}
