import { describe, it, expect } from "bun:test";
import { render, screen, fireEvent } from "@testing-library/react";
import { ZeroResultRecovery } from "../../src/components/zero-result-recovery";

describe("ZeroResultRecovery", () => {
  it("renders the query and search tips", () => {
    let cleared = false;
    let selected = "";

    render(
      <ZeroResultRecovery
        query="テスト大学架空学部"
        onClear={() => {
          cleared = true;
        }}
        onSelectQuery={(q) => {
          selected = q;
        }}
      />
    );

    expect(screen.getByText(/テスト大学架空学部/)).toBeDefined();
    expect(screen.getByText("検索のヒント")).toBeDefined();
    expect(screen.getByText("単語を区切って検索:")).toBeDefined();

    const clearBtn = screen.getByText("検索条件をクリア");
    fireEvent.click(clearBtn);
    expect(cleared).toBe(true);
  });

  it("suggests first token when multi-word query is entered and allows clicking the inline keyword", () => {
    let selected = "";

    render(
      <ZeroResultRecovery
        query="早稲田 架空学部"
        onClear={() => {}}
        onSelectQuery={(q) => {
          selected = q;
        }}
      />
    );

    const inlineKeywordBtn = screen.getByText("「早稲田」");
    expect(inlineKeywordBtn).toBeDefined();

    fireEvent.click(inlineKeywordBtn);
    expect(selected).toBe("早稲田");
  });

  it("allows selecting a popular university shortcut", () => {
    let selected = "";

    render(
      <ZeroResultRecovery
        query="存在しない大学"
        onClear={() => {}}
        onSelectQuery={(q) => {
          selected = q;
        }}
      />
    );

    const univBtn = screen.getByText("東京大学");
    fireEvent.click(univBtn);
    expect(selected).toBe("東京大学");
  });
});
