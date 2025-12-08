import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

const SearchBar = ({ 
  onSearch, 
  placeholder = "Search profiles...",
  className = "" 
}) => {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      onSearch(query);
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query, onSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(query); // still supports pressing Enter
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