import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "../app/App";
import { useAppStore } from "../state/store";

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      datasetName: "",
      headers: [],
      rows: [],
      metas: [],
      loadingProgress: 0,
      filters: { search: "", categoryValues: [] },
      grouping: { aggregation: "sum" },
      views: [],
      activeViewId: "default",
      summaries: [],
      charts: [],
      mainChart: undefined,
      filteredRows: [],
      error: undefined,
    });
  });

  it("loads sample and shows summary + table", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /load sample dataset/i }));

    await waitFor(() => expect(screen.getByText("Data Table")).toBeInTheDocument());
    expect(screen.getByText("Rows")).toBeInTheDocument();
  });

  it("changing global search reduces row count", async () => {
    const user = userEvent.setup();
    render(<App />);

    await user.click(screen.getByRole("button", { name: /load sample dataset/i }));
    await waitFor(() => expect(screen.getByText(/Rows: 30/)).toBeInTheDocument());

    const search = screen.getByPlaceholderText(/find in any cell/i);
    await user.clear(search);
    await user.type(search, "beauty");

    await waitFor(() => expect(screen.getByText(/Rows: 5/)).toBeInTheDocument());
  });
});
