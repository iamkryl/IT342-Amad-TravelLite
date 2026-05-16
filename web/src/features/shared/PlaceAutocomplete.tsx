import { useState, useEffect, useRef } from 'react';

interface Place {
  display_name: string;
  place_id: string;
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  destinationBias?: string;
}

export default function PlaceAutocomplete({ value, onChange, placeholder, destinationBias }: Props) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Place[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.trim().length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const searchQuery = destinationBias
          ? `${val} ${destinationBias.split(',')[0].trim()}`
          : val;
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=5`,
          { headers: { 'Accept-Language': 'en' } }
        );
        const data = await res.json();
        setSuggestions(data);
        setShowDropdown(true);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (place: Place) => {
    const parts = place.display_name.split(',');
    const shortName = parts.slice(0, 2).join(',').trim();
    setQuery(shortName);
    onChange(shortName);
    setShowDropdown(false);
    setSuggestions([]);
  };

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6b7280]">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={query}
          onChange={handleChange}
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
          placeholder={placeholder || 'Search place...'}
          className="w-full bg-[#111827] border border-white/8 rounded-[10px] pl-10 pr-3 py-[11px] text-[#e5e7eb] text-[13.5px] placeholder-[#4b5563] outline-none focus:border-[#EF7722] transition-colors"
        />
        {loading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <div className="w-3 h-3 border-2 border-[#EF7722] border-t-transparent rounded-full animate-spin" />
          </span>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div
          className="absolute z-50 w-full mt-1 rounded-xl overflow-hidden shadow-2xl"
          style={{ background: '#1a2332', border: '1px solid rgba(255,255,255,0.1)' }}
        >
          {suggestions.map((place) => (
            <button
              key={place.place_id}
              onClick={() => handleSelect(place)}
              className="w-full text-left px-4 py-3 text-[13px] text-[#e5e7eb] flex items-start gap-3 transition-colors"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,119,34,0.1)')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
            >
              <svg className="w-4 h-4 text-[#EF7722] flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="truncate">{place.display_name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}