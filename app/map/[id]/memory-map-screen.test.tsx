import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getMemoryMap } from "@/lib/memory-map-data";
import { MemoryMapScreen } from "./memory-map-screen";

const push = vi.fn();
const back = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, back })
}));

describe("MemoryMapScreen", () => {
  const mapClient = {
    getMemoryMap: async (wordId: string) => getMemoryMap(wordId)
  };

  beforeEach(() => {
    push.mockClear();
    back.mockClear();
  });

  it("loads the AI memory map from the API client", async () => {
    render(<MemoryMapScreen wordId="w1" apiClient={{ getMemoryMap: async () => getMemoryMap("w3") }} />);

    expect(await screen.findByRole("heading", { name: "achieve 记忆图谱" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /achievement/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /accomplish/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /fail/ })).toBeInTheDocument();
  });

  it("renders the AI memory map with relation nodes and legend", async () => {
    render(<MemoryMapScreen wordId="w1" apiClient={mapClient} />);

    expect(await screen.findByRole("heading", { name: "persist 记忆图谱" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "AI 记忆图谱工作台" })).toBeInTheDocument();
    expect(screen.getByText("关系网络")).toBeInTheDocument();
    expect(screen.getByText("节点详情")).toBeInTheDocument();
    expect(screen.getByText("学习闭环")).toBeInTheDocument();
    expect(screen.getByText("AI 记忆图谱")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /persistent/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /quit/ })).toBeInTheDocument();
    expect(screen.getByText("S · 同义")).toBeInTheDocument();
    expect(screen.getByText("A · 反义")).toBeInTheDocument();
    expect(screen.getByText("D · 派生")).toBeInTheDocument();
  });

  it("selects a related node and switches to root clue mode", async () => {
    const user = userEvent.setup();
    render(<MemoryMapScreen wordId="w1" apiClient={mapClient} />);

    await screen.findByRole("heading", { name: "persist 记忆图谱" });

    await user.click(screen.getByRole("button", { name: /persistent/ }));
    expect(screen.getByText("派生关系")).toBeInTheDocument();
    expect(screen.getByText("adj. 坚持不懈的")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "词根线索" }));
    expect(screen.getByText("per 一直 + sist 站立，像一直站在目标旁边")).toBeInTheDocument();
  });

  it("navigates back to the word detail and retry study routes", async () => {
    const user = userEvent.setup();
    render(<MemoryMapScreen wordId="w1" apiClient={mapClient} />);

    await screen.findByRole("heading", { name: "persist 记忆图谱" });

    await user.click(screen.getByRole("button", { name: "返回单词" }));
    expect(push).toHaveBeenCalledWith("/word/w1");

    await user.click(screen.getByRole("button", { name: "复习这个词" }));
    expect(push).toHaveBeenCalledWith("/study/mc");

    await user.click(screen.getByRole("button", { name: "返回" }));
    expect(back).toHaveBeenCalledTimes(1);
  });

  it("routes desktop map actions", async () => {
    const user = userEvent.setup();
    render(<MemoryMapScreen wordId="w1" apiClient={mapClient} />);

    await screen.findByRole("heading", { name: "persist 记忆图谱" });

    await user.click(screen.getByRole("button", { name: "返回今日学习" }));
    expect(push).toHaveBeenCalledWith("/dashboard");

    await user.click(screen.getByRole("button", { name: "返回单词 Web" }));
    expect(push).toHaveBeenCalledWith("/word/w1");

    await user.click(screen.getByRole("button", { name: "开始专项复习 Web" }));
    expect(push).toHaveBeenCalledWith("/study/mc");
  });

  it("renders initial map data while the API refresh is still pending", () => {
    render(
      <MemoryMapScreen
        wordId="w1"
        initialModel={getMemoryMap("w2")}
        apiClient={{
          getMemoryMap: async () => new Promise<never>(() => {})
        }}
      />
    );

    expect(screen.getByRole("heading", { name: "ambition 记忆图谱" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /ambitious/ })).toBeInTheDocument();
  });

  it("shows an API failure state and retries loading the map", async () => {
    const user = userEvent.setup();
    const getMemoryMapMock = vi.fn<(wordId: string) => Promise<ReturnType<typeof getMemoryMap>>>();
    getMemoryMapMock.mockRejectedValueOnce(new Error("Memory map service offline"));
    getMemoryMapMock.mockResolvedValueOnce(getMemoryMap("w1"));

    render(<MemoryMapScreen wordId="w1" apiClient={{ getMemoryMap: getMemoryMapMock }} />);

    expect(await screen.findByText("记忆图谱暂时加载失败")).toBeInTheDocument();
    expect(screen.getByText("Memory map service offline")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "重新加载记忆图谱" }));

    expect(await screen.findByRole("heading", { name: "persist 记忆图谱" })).toBeInTheDocument();
    expect(getMemoryMapMock).toHaveBeenCalledTimes(2);
  });
});
