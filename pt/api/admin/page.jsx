"use client";

import { useState } from "react";

export default function AdminPage() {
  const [url, setUrl] = useState("");
  const [message, setMessage] = useState("");

  // إضافة موقع يدويًا
  async function addSite() {
    if (!url) return alert("أدخل رابط الموقع!");
    try {
      const res = await fetch("/api/admin/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      if (res.ok) {
        setMessage("✅ تم إضافة الموقع بنجاح");
        setUrl("");
      } else {
        setMessage("❌ حدث خطأ أثناء الإضافة");
      }
    } catch (err) {
      setMessage("❌ خطأ في الشبكة");
    }
  }

  // تشغيل الزاحف
  async function runCrawler() {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/admin/crawl", {
        method: "POST",
        headers: {
          Authorization: "Bearer " + token
        }
      });
      if (res.ok) {
        setMessage("🕷️ بدأ الزحف بنجاح");
      } else {
        setMessage("❌ لم يتمكن الزاحف من العمل");
      }
    } catch {
      setMessage("❌ خطأ في الشبكة");
    }
  }

  return (
    <div className="p-10 max-w-xl mx-auto text-right">
      <h1 className="text-3xl font-bold mb-6">لوحة التحكم Admin</h1>

      <div className="mb-6">
        <input
          type="text"
          placeholder="أدخل رابط الموقع"
          className="border p-2 w-full"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button
          onClick={addSite}
          className="bg-green-600 text-white px-4 py-2 mt-2"
        >
          إضافة الموقع
        </button>
      </div>

      <div className="mb-6">
        <button
          onClick={runCrawler}
          className="bg-blue-600 text-white px-4 py-2"
        >
          تشغيل الزاحف 🕷️
        </button>
      </div>

      {message && (
        <div className="mt-4 p-2 bg-gray-100 border rounded">{message}</div>
      )}
    </div>
  );
}
