"use client";

import { useState } from "react";
import FeedTab from "./FeedTab";
import ThreadsFeed from "./ThreadsFeed";
import MediaFeed from "./MediaFeed";

type FeedTab = "threads" | "media";

export default function FeedClient() {
  const [activeTab, setActiveTab] = useState<FeedTab>("threads");

  return (
    <>
      <FeedTab onChange={setActiveTab} />

      {activeTab === "threads" && <ThreadsFeed />}
      {activeTab === "media" && <MediaFeed />}
    </>
  );
}
