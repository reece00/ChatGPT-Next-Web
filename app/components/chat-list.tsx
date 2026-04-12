import DeleteIcon from "../icons/delete.svg";
import BotIcon from "../icons/bot.svg";

import styles from "./home.module.scss";
import {
  DragDropContext,
  Droppable,
  Draggable,
  OnDragEndResponder,
} from "@hello-pangea/dnd";

import { useChatStore } from "../store";

import Locale from "../locales";
import { Link, useNavigate } from "react-router-dom";
import { Path } from "../constant";
import { Mask } from "../store/mask";
import { useRef, useEffect, useMemo, useState } from "react";
import { showConfirm } from "./ui-lib";
import { useDebounce } from "use-debounce";

import { useLocation } from "react-router-dom";

export function ChatItem(props: {
  onClick?: () => void;
  onDelete?: () => void;
  title: string;
  count: number;
  time: string;
  selected: boolean;
  id: string;
  index: number;
  narrow?: boolean;
  mask: Mask;
  dragDisabled?: boolean;
}) {
  const draggableRef = useRef<HTMLDivElement | null>(null);
  /* useEffect(() => {
      console.debug("执行滚动对话条");

    if (props.selected && draggableRef.current) {
      draggableRef.current?.scrollIntoView({
        block: "center",
      });
    }
  }, [props.selected]);  */

  const location = useLocation();

  useEffect(() => {
    console.debug("路由变化了", location.pathname);
    if (location.pathname === "/") {
      const scrollPosition = sessionStorage.getItem("scrollPosition");
      if (scrollPosition) {
        console.debug("执行滚动对话条" + scrollPosition + draggableRef.current);
        window.scrollTo(0, parseInt(scrollPosition, 10));
      }
    }
  }, [location]);

  return (
    <Draggable
      draggableId={`${props.id}`}
      index={props.index}
      isDragDisabled={props.dragDisabled}
    >
      {(provided) => (
        <div
          className={`${styles["chat-item"]} ${
            props.selected && styles["chat-item-selected"]
          }`}
          onClick={props.onClick}
          ref={(ele) => {
            draggableRef.current = ele;
            provided.innerRef(ele);
          }}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          title={`${props.title}\n${Locale.ChatItem.ChatItemCount(
            props.count,
          )}`}
        >
          {props.narrow ? (
            <div className={styles["chat-item-narrow"]}>
              <div className={styles["chat-item-avatar"] + " no-dark"}></div>
              <div className={styles["chat-item-narrow-count"]}>
                {props.count}
              </div>
            </div>
          ) : (
            <>
              <div className={styles["chat-item-title"]}>{props.title}</div>
              <div className={styles["chat-item-info"]}>
                <div className={styles["chat-item-count"]}>
                  {Locale.ChatItem.ChatItemCount(props.count)}
                </div>
                <div className={styles["chat-item-date"]}>{props.time}</div>
              </div>
            </>
          )}

          <div
            className={styles["chat-item-delete"]}
            onClickCapture={props.onDelete}
          >
            <DeleteIcon />
          </div>
        </div>
      )}
    </Draggable>
  );
}

export function ChatList(props: { narrow?: boolean }) {
  const [sessions, selectedIndex, selectSession, moveSession] = useChatStore(
    (state) => [
      state.sessions,
      state.currentSessionIndex,
      state.selectSession,
      state.moveSession,
    ],
  );
  const chatStore = useChatStore();
  const navigate = useNavigate();

  const [queryInput, setQueryInput] = useState("");
  const [debouncedQuery] = useDebounce(queryInput, 1000);
  const [query, setQuery] = useState("");
  const [showSearchTips, setShowSearchTips] = useState(false);

  const doSearch = (text: string) => {
    setQuery(text);
  };

  useEffect(() => {
    const trimmed = queryInput.trim();
    if (trimmed.length > 3) {
      setQuery(debouncedQuery);
    } else if (trimmed.length === 0) {
      setQuery("");
    } else if (query !== "" && query !== queryInput) {
      setQuery("");
    }
  }, [debouncedQuery, queryInput, query]);

  const normalizedQuery = query.trim().toLowerCase();
  const isSearching = normalizedQuery.length > 0;

  const filteredSessions = useMemo(() => {
    const indexed = sessions.map((session, originalIndex) => ({
      session,
      originalIndex,
    }));

    if (!isSearching) return indexed;

    return indexed.filter(({ session }) => {
      const topic = (session.topic ?? "").toLowerCase();
      if (topic.includes(normalizedQuery)) return true;
      return session.messages.some((m) => {
        const content = (m.content ?? "").toLowerCase();
        return content.includes(normalizedQuery);
      });
    });
  }, [sessions, isSearching, normalizedQuery]);

  const isDragDisabled = useMemo(() => {
    return queryInput.trim().length > 0;
  }, [queryInput]);

  const onDragEnd: OnDragEndResponder = (result) => {
    if (isDragDisabled) return;

    const { destination, source } = result;
    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    moveSession(source.index, destination.index);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="chat-list">
        {(provided) => (
          <div
            className={styles["chat-list"]}
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {!props.narrow && (
              <div className={styles["chat-list-search"]}>
                <input
                  type="text"
                  className={styles["chat-list-search-input"]}
                  placeholder={Locale.Home.SearchChat}
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      doSearch(queryInput);
                    }
                  }}
                />
                <div
                  className={styles["chat-list-search-tips"] + " clickable"}
                  onMouseEnter={() => setShowSearchTips(true)}
                  onMouseLeave={() => setShowSearchTips(false)}
                >
                  ?
                  {showSearchTips && (
                    <div className={styles["search-tips-content"]}>
                      <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                        搜索说明
                      </div>
                      <div>• 输入超过 3 个字：1秒后自动搜索</div>
                      <div>• 输入 1-3 个字：按回车 (Enter) 搜索</div>
                      <div>• 清空搜索框：恢复完整列表</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {filteredSessions.map(({ session, originalIndex }, i) => (
              <ChatItem
                title={session.topic}
                time={new Date(session.lastUpdate).toLocaleString()}
                count={session.messages.length}
                key={session.id}
                id={session.id}
                index={i}
                selected={originalIndex === selectedIndex}
                onClick={() => {
                  console.log("储存滚动位置" + window.scrollY.toString());
                  sessionStorage.setItem(
                    "scrollPosition",
                    window.scrollY.toString(),
                  );
                  navigate(Path.Chat);
                  selectSession(originalIndex);
                }}
                onDelete={async () => {
                  if (
                    !props.narrow ||
                    (await showConfirm(Locale.Home.DeleteChat))
                  ) {
                    chatStore.deleteSession(originalIndex);
                  }
                }}
                narrow={props.narrow}
                mask={session.mask}
                dragDisabled={isDragDisabled}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
