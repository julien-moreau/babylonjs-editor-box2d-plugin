import * as React from "react";
import { Editor, IPlugin } from "babylonjs-editor";

import { Toolbar } from "./toolbar";
import { ShapesManager } from "./shapes-manager";
import { ShapesExporter } from "./shapes-exporter";

/**
 * Registers the plugin by returning the IPlugin content.
 * @param editor defines the main reference to the editor.
 */
export const registerEditorPlugin = (editor: Editor): IPlugin => {
    const shapesManager = new ShapesManager(editor);

    const shapesExporter = new ShapesExporter(editor, shapesManager);
    shapesExporter.init();

    return {
        /**
         * Defines the list of all toolbar elements to add when the plugin has been loaded.
         */
        toolbar: [
            { buttonLabel: "Box 2D", buttonIcon: "box", content: <Toolbar editor={editor} shapesManager={shapesManager} /> }
        ],

        /**
         * If implemented, should return an object (plain JSON object) that will be saved
         * in the workspace file. This will be typically used to store preferences of the plugin
         * work a given workspace and not globally.
         * If implemented, the preferences will be saved in the .editorworkspace file each time the user
         * saves the project.
         */
        getWorkspacePreferences: () => {
            return { };
        },

        /**
         * When the plugin saved preferences (@see .getWorkspacePreferences) this function
         * will be called giving the plain JSON representation of the user's preferences for
         * the current plugin.
         */
        setWorkspacePreferences: (preferences: any) => {
            console.log(preferences);
        },

        /**
         * Called on the plugin is being disposed.
         */
        onDispose: () => {
            shapesExporter.dispose();
        },
    };
}
