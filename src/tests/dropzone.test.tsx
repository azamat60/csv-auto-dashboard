import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import { Dropzone } from "../components/Dropzone";

describe("Dropzone", () => {
  it("uploads csv file via input", async () => {
    const user = userEvent.setup();
    const onFile = vi.fn();

    render(<Dropzone onFile={onFile} onSample={() => undefined} loading={false} progress={0} />);

    const file = new File(["a,b\n1,2"], "test.csv", { type: "text/csv" });
    const input = screen.getByTestId("csv-input");
    await user.upload(input, file);

    expect(onFile).toHaveBeenCalledTimes(1);
    expect(onFile.mock.calls[0][0]).toBeInstanceOf(File);
  });
});
