"use client";

import dynamic from "next/dynamic";

const BoardConstruction = dynamic(() => import("@/components/BoardConstruction"), {
  ssr: false,
  loading: () => <section className="board-loading" aria-label="Board construction"><div><span className="mono">Board construction</span><h2>See how the layers carry the load.</h2><p>Technical illustration loading.</p></div></section>,
});

export function BoardConstructionLoader() {
  return <BoardConstruction />;
}
