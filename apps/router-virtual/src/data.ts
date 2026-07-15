export interface Item {
  id: string;
  name: string;
  stock: number;
}

export const items: Item[] = [
  { id: "1", name: "Widget", stock: 12 },
  { id: "2", name: "Gadget", stock: 0 },
  { id: "3", name: "Gizmo", stock: 4 },
];
