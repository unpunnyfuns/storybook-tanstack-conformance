export type PostTag = "news" | "guide" | "update";

export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "member";
}

export interface Post {
  id: string;
  title: string;
  body: string;
  tag: PostTag;
  published: boolean;
}

export const users: User[] = [
  { id: "1", name: "Ada Lovelace", email: "ada@example.com", role: "admin" },
  { id: "2", name: "Alan Turing", email: "alan@example.com", role: "member" },
  { id: "3", name: "Grace Hopper", email: "grace@example.com", role: "admin" },
];

export const posts: Post[] = Array.from({ length: 23 }, (_, i) => {
  const tags: PostTag[] = ["news", "guide", "update"];
  return {
    id: String(i + 1),
    title: `Post ${i + 1}`,
    body: `Body text for post ${i + 1}.`,
    tag: tags[i % 3],
    published: i % 5 !== 0,
  };
});

const delay = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

export async function getUser(id: string): Promise<User | undefined> {
  await delay(300);
  return users.find((u) => u.id === id);
}

export async function getPost(id: string): Promise<Post | undefined> {
  await delay(300);
  return posts.find((p) => p.id === id);
}

export function listPosts(opts: {
  tag: PostTag | "all";
  page: number;
  pageSize: number;
  sort: "newest" | "oldest";
}): { items: Post[]; total: number; pageCount: number } {
  const filtered = opts.tag === "all" ? posts : posts.filter((p) => p.tag === opts.tag);
  const sorted = filtered.toSorted((a, b) =>
    opts.sort === "newest" ? Number(b.id) - Number(a.id) : Number(a.id) - Number(b.id),
  );
  const total = sorted.length;
  const pageCount = Math.max(1, Math.ceil(total / opts.pageSize));
  const start = (opts.page - 1) * opts.pageSize;
  return { items: sorted.slice(start, start + opts.pageSize), total, pageCount };
}
