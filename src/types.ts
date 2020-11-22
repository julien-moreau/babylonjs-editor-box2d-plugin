export interface IExportedShape {
    /**
     * Defines the name of the shape.
     */
    name: string;
    /**
     * Defines the id of the shape.
     */
    id: string;
    /**
     * Defines the type of the shape.
     */
    type: "cube" | "sphere";
    /**
     * Defines the position of the shape.
     */
    position: number[];
    /**
     * Defines the rotation of the shape.
     */
    rotation: number[];
    /**
     * Defines the scale of the shape.
     */
    scaling: number[];
}
