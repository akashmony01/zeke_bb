type LinkItemType = {
  "Link #": string;
  Link: string;
  Title: string;
  Description: string;
  Source: string;
  Deploy: string;
  Categories: string[];
  [key: string]: string | string[];
};

export async function fetchGoogleSheetData() {
  const response = await fetch(
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vT8F3_hotUXYBgSazyKmL4xHi8_CCILRLR9FNnGTKWgJ1oGY-DzR0_p_icX3_RqXf42JjjyoSx6gju8/pub?gid=0&single=true&output=csv"
  );
  const csvText = await response.text();

  // Convert CSV to JSON
  const rows = csvText.split("\n").map((row) => row.split(","));

  if (rows.length === 0) {
    throw new Error("CSV file is empty or invalid");
  }

  const headers = rows.shift() as string[];

  // Define non-category columns
  const nonCategoryColumns = ["Link #", "Link", "Title", "Description", "Source", "Deploy", "No Cited Sources"];

  const categoryColumns = headers.filter((header) => !nonCategoryColumns.includes(header));

  // Process links while excluding category columns
  const all_links = rows
    .map((row) => {
      const linkItem = Object.fromEntries(headers.map((h, i) => [h.trim(), row[i]?.trim() || ""]));

      const ProcessedLink = {
        ...Object.fromEntries(
          Object.entries(linkItem).filter(([key]) => nonCategoryColumns.includes(key))
        ),
        Categories: categoryColumns.filter((category) => linkItem[category] === "TRUE"),
      } as LinkItemType;

      return ProcessedLink;
    })
    .filter((link) => link.Deploy === "TRUE"); // Keep only deployed links

  // Extract categories that have at least one link
  const filtered_categories = categoryColumns.filter((category) =>
    all_links.some((link) => link.Categories.includes(category))
  );

  return { all_links, all_categories: filtered_categories };
}
