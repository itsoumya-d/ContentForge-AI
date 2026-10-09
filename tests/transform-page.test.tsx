// @vitest-environment jsdom
import React from "react";
import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
const { generateSocialContent, success, warning, error } = vi.hoisted(() => ({generateSocialContent: vi.fn(), success: vi.fn(), warning: vi.fn(), error: vi.fn()}));
vi.mock("@/lib/actions/transform", () => ({generateSocialContent}));
vi.mock("sonner", () => ({toast: {success, warning, error}}));
import TransformPage from "@/app/dashboard/transform/page";
const fill = () => fireEvent.change(screen.getByPlaceholderText("Paste your article, blog post, or notes..."), {target: {value: "Synthetic input"}});
const generate = () => fireEvent.click(screen.getByRole("button", {name: "Generate Content"}));
beforeEach(() => {generateSocialContent.mockReset();});
afterEach(cleanup);

it("shows total failure as an alert without generated placeholders or success", async () => {
    generateSocialContent.mockResolvedValue({error: "No content was generated. Please try again.", errors: {twitter: "Could not generate valid content.", linkedin: "Could not generate valid content."}});
    render(<TransformPage />);fill();generate();
    expect((await screen.findByRole("alert")).textContent).toContain("No content was generated");
    expect(screen.queryByText("Generated Content")).toBeNull();
    expect(success).not.toHaveBeenCalled();
    expect(error).toHaveBeenCalledOnce();
});
it("keeps valid partial output visible and identifies failed platforms", async () => {
    generateSocialContent.mockResolvedValue({twitter: ["Valid synthetic post"], errors: {linkedin: "Could not generate valid content."}});
    render(<TransformPage />);fill();generate();
    expect((await screen.findByRole("alert")).textContent).toContain("LinkedIn");
    expect(screen.getByText("Valid synthetic post")).toBeTruthy();
    expect(success).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledOnce();
});
it("retries after failure and clears the stale error on success", async () => {
    generateSocialContent.mockResolvedValueOnce({error: "Synthetic failure"}).mockResolvedValueOnce({twitter: ["Recovered synthetic post"]});
    render(<TransformPage />);fill();generate();
    await screen.findByRole("alert");generate();
    await screen.findByText("Recovered synthetic post");
    expect(screen.queryByRole("alert")).toBeNull();
    expect(success).toHaveBeenCalledOnce();
});
it("renders unexpected action failure visibly", async () => {
    generateSocialContent.mockRejectedValue(new Error("Synthetic transport failure"));
    vi.spyOn(console, "error").mockImplementation(() => {});
    render(<TransformPage />);fill();generate();
    expect((await screen.findByRole("alert")).textContent).toContain("Could not generate content");
    expect(success).not.toHaveBeenCalled();
});
it("guards duplicate clicks while generation is pending", async () => {
    let finish!: (result: {twitter: string[]}) => void;
    generateSocialContent.mockReturnValue(new Promise(resolve => {finish = resolve;}));
    render(<TransformPage />);fill();
    act(() => {generate();generate();});
    expect(generateSocialContent).toHaveBeenCalledOnce();
    await act(async () => {finish({twitter: ["One result"]});});
    await waitFor(() => expect(screen.getByText("One result")).toBeTruthy());
});
it("preserves an unselected successful platform when retrying only a failed platform", async () => {
    generateSocialContent.mockResolvedValueOnce({twitter: ["Keep this draft"], errors: {linkedin: "Synthetic failure"}}).mockResolvedValueOnce({linkedin: "Recovered LinkedIn draft"});
    render(<TransformPage />);fill();generate();
    await screen.findByText("Keep this draft");
    fireEvent.click(screen.getByRole("checkbox", {name: "Twitter Thread"}));
    generate();
    await screen.findByDisplayValue("Recovered LinkedIn draft");
    expect(screen.getByText("Keep this draft")).toBeTruthy();
    expect(screen.queryByRole("alert")).toBeNull();
});
it("does not carry drafts across a changed source", async () => {
    generateSocialContent.mockResolvedValueOnce({twitter: ["Old source draft"], errors: {linkedin: "Synthetic failure"}}).mockResolvedValueOnce({linkedin: "New source draft"});
    render(<TransformPage />);fill();generate();await screen.findByText("Old source draft");
    fireEvent.click(screen.getByRole("checkbox", {name: "Twitter Thread"}));
    fireEvent.change(screen.getByPlaceholderText("Paste your article, blog post, or notes..."), {target: {value: "Different synthetic input"}});
    generate();await screen.findByDisplayValue("New source draft");
    expect(screen.queryByText("Old source draft")).toBeNull();
});
it("freezes source and configuration while a request is pending", async () => {
    let finish!: (value: {twitter: string[]}) => void;
    generateSocialContent.mockReturnValue(new Promise(resolve => {finish = resolve;}));
    render(<TransformPage />);fill();generate();
    expect((screen.getByPlaceholderText("Paste your article, blog post, or notes...") as HTMLTextAreaElement).disabled).toBe(true);
    for (const checkbox of screen.getAllByRole("checkbox")) expect((checkbox as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(true);
    await act(async () => {finish({twitter: ["Complete"]});});
    expect((screen.getByRole("combobox") as HTMLButtonElement).disabled).toBe(false);
});
it("resets a removed platform tab so remaining successful content stays visible", async () => {
    generateSocialContent.mockResolvedValueOnce({twitter: ["Initial Twitter post"]}).mockResolvedValueOnce({linkedin: "Remaining LinkedIn result", errors: {twitter: "Synthetic failure"}});
    render(<TransformPage />);fill();generate();
    await screen.findByText("Initial Twitter post");
    fireEvent.mouseDown(screen.getByRole("tab", {name: "X / Twitter"}), {button: 0, ctrlKey: false});
    expect(screen.getByRole("tab", {name: "X / Twitter"}).getAttribute("aria-selected")).toBe("true");
    generate();await screen.findByDisplayValue("Remaining LinkedIn result");
    expect(screen.getByRole("tab", {name: "All View"}).getAttribute("aria-selected")).toBe("true");
});
