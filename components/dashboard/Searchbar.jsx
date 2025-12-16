import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import debounce from "lodash/debounce";

const SearchBar = ({
  onSearch,
  placeholder = "Search profiles...",
  className = "",
  delay = 300,
}) => {
  const [query, setQuery] = useState("");

  const debouncedSearch = useMemo(
    () =>
      debounce((value) => {
        onSearch(value);
      }, delay),
    [onSearch, delay]
  );

  useEffect(() => {
    const trimmed = query.trim();

    // Avoid initial empty search
    if (!trimmed) {
      debouncedSearch.cancel();
      onSearch("");
      return;
    }

    debouncedSearch(trimmed);

    return () => debouncedSearch.cancel();
  }, [query, debouncedSearch, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    debouncedSearch.cancel();
    onSearch(query.trim());
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="join w-full">
        <input
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="input input-bordered text-black join-item flex-1 bg-white border-[#4E56C0]"
        />

        <button
          type="submit"
          className="btn bg-[#4E56C0] text-white border-0 join-item"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
};

export default SearchBar;
