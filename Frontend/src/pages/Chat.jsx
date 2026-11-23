/* eslint-disable react-hooks/set-state-in-effect */
import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { listConversations, getMessages, sendMessage } from "../api/chatApi";
import { askAssistant } from "../api/aiApi";
import useAuth from "../hooks/useAuth";
import useSocket from "../hooks/useSocket";
import formatCurrency from "../utils/formatCurrency";
import { PLACEHOLDER } from "../utils/placeholder";
import { Tabs } from "../components/ui/kit.jsx";

function Messages() {
  const { user } = useAuth();
  const { socket, connected } = useSocket() || {};
  const [params, setParams] = useSearchParams();
  const activeId = params.get("c");
  const [convos, setConvos] = useState([]);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottom = useRef(null);

  const loadList = useCallback(async () => {
    try {
      const { data } = await listConversations();
      setConvos(data.conversations);
    } catch {
      setConvos([]);
    }
  }, []);

  const loadMessages = useCallback(async () => {
    if (!activeId) return setMessages([]);
    try {
      const { data } = await getMessages(activeId);
      setMessages(data.messages);
    } catch {
      setMessages([]);
    }
  }, [activeId]);

  useEffect(() => { loadList(); }, [loadList]);
  useEffect(() => { loadMessages(); }, [loadMessages]);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = ({ conversationId, message }) => {
      if (conversationId === activeId) {
        setMessages((prev) => (prev.some((m) => m._id === message._id) ? prev : [...prev, message]));
        getMessages(conversationId).catch(() => {});
      }
      loadList();
    };
    socket.on("chat:message", onMessage);
    return () => socket.off("chat:message", onMessage);
  }, [socket, activeId, loadList]);

  useEffect(() => {
    if (connected) return;
    const t = setInterval(() => { loadMessages(); loadList(); }, 10000);
    return () => clearInterval(t);
  }, [connected, loadMessages, loadList]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || !activeId) return;
    setSending(true);
    try {
      const { data } = await sendMessage(activeId, text.trim());
      setMessages((prev) => [...prev, data.message]);
      setText("");
      loadList();
    } catch (err) {
      toast.error(err.response?.data?.message || "Message not sent");
    } finally {
      setSending(false);
    }
  };

  const active = convos.find((c) => c._id === activeId);

  return (
    <div className="grid h-[70vh] overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm md:grid-cols-[300px_1fr]">
      <aside className={`overflow-y-auto border-r border-gray-200 dark:border-zinc-800 ${activeId ? "hidden md:block" : ""}`}>
        {convos.length === 0 && <p className="p-6 text-xs text-gray-500">No conversations yet. Open a product and press "Chat with seller".</p>}
        {convos.map((c) => (
          <button key={c._id} onClick={() => setParams({ c: c._id })} className={`block w-full border-b border-gray-100 dark:border-zinc-800 p-4 text-left transition ${c._id === activeId ? "bg-orange-50 dark:bg-orange-950/40" : "hover:bg-gray-50 dark:hover:bg-zinc-800/50"}`}>
            <div className="flex justify-between items-center"><b className="font-bold text-sm">{c.other?.username}</b>{c.unread > 0 && <span className="rounded-full bg-orange-600 px-2 py-0.5 text-xs text-white font-bold">{c.unread}</span>}</div>
            {c.product && <p className="text-xs text-orange-600 font-medium">re: {c.product.name}</p>}
            <p className="line-clamp-1 text-xs text-gray-500 mt-1">{c.lastMessage || "No messages yet"}</p>
          </button>
        ))}
      </aside>

      <section className={`flex min-h-0 flex-col bg-gray-50/50 dark:bg-zinc-950/50 ${activeId ? "" : "hidden md:flex"}`}>
        {!activeId ? <div className="m-auto text-sm text-gray-500">Select a conversation from the sidebar</div> : (
          <>
            <header className="flex items-center gap-3 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
              <button onClick={() => setParams({})} className="md:hidden font-bold text-lg" aria-label="Back">←</button>
              <b className="font-bold">{active?.other?.username || "Conversation"}</b>
              <span className={`ml-auto text-xs font-semibold ${connected ? "text-emerald-600" : "text-gray-400"}`}>{connected ? "● live" : "○ syncing"}</span>
            </header>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = String(m.senderId) === String(user.id);
                return (
                  <div key={m._id} className={`flex ${mine ? "justify-end" : ""}`}>
                    <p className={`max-w-[75%] whitespace-pre-wrap break-words rounded-2xl px-4 py-2.5 text-sm shadow-sm ${mine ? "bg-orange-600 text-white" : "bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700"}`}>{m.text}</p>
                  </div>
                );
              })}
              <div ref={bottom} />
            </div>
            <form onSubmit={send} className="flex gap-2 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
              <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Type a message..." className="input flex-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none" />
              <button disabled={sending || !text.trim()} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition">Send</button>
            </form>
          </>
        )}
      </section>
    </div>
  );
}

function Assistant() {
  const [log, setLog] = useState([{ role: "assistant", content: "Hi! Tell me what you're looking for and your budget, and I'll find matching products.", products: [] }]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const bottom = useRef(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth" }); }, [log]);

  const send = async (e) => {
    e.preventDefault();
    const message = text.trim();
    if (!message) return;
    const history = log.slice(1).map(({ role, content }) => ({ role, content }));
    setLog((l) => [...l, { role: "user", content: message, products: [] }]);
    setText("");
    setBusy(true);
    try {
      const { data } = await askAssistant(message, history);
      setLog((l) => [...l, { role: "assistant", content: data.reply, products: data.products.slice(0, 4), source: data.source }]);
    } catch (err) {
      setLog((l) => [...l, { role: "assistant", content: err.response?.data?.message || "Sorry, I couldn't answer that right now.", products: [] }]);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex h-[70vh] flex-col overflow-hidden rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
      <div className="flex-1 space-y-4 overflow-y-auto p-6">
        {log.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className="max-w-[85%] space-y-2">
              <p className={`whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm shadow-sm ${m.role === "user" ? "bg-orange-600 text-white" : "bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100"}`}>{m.content}</p>
              {m.products?.length > 0 && (
                <div className="grid gap-2 sm:grid-cols-2 mt-2">
                  {m.products.map((p) => (
                    <Link key={p._id} to={`/product/${p._id}`} className="flex items-center gap-3 rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-2.5 text-sm hover:border-orange-500 transition shadow-sm">
                      <img src={p.images?.[0] || PLACEHOLDER} alt="" className="h-12 w-12 rounded-xl object-cover" />
                      <span className="min-w-0"><span className="line-clamp-1 font-semibold">{p.name}</span><span className="text-orange-600 font-bold">{formatCurrency(p.price)}</span></span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {busy && <p className="text-xs text-gray-400 animate-pulse">Assistant is thinking...</p>}
        <div ref={bottom} />
      </div>
      <form onSubmit={send} className="flex gap-2 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-3">
        <input value={text} onChange={(e) => setText(e.target.value)} maxLength={500} placeholder="e.g. a gift under $50 for a runner" className="input flex-1 bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-2.5 text-sm outline-none" />
        <button disabled={busy || !text.trim()} className="bg-orange-600 hover:bg-orange-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition">Ask</button>
      </form>
    </div>
  );
}

export default function Chat() {
  const [tab, setTab] = useState("messages");
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-6">
        <h1 className="text-3xl font-black tracking-tight">Messages & AI Assistant</h1>
        <Tabs value={tab} onChange={setTab} tabs={[["messages", "💬 Messages"], ["assistant", "🤖 Shopping Assistant"]]} />
        {tab === "messages" ? <Messages /> : <Assistant />}
      </div>
    </div>
  );
}