"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { categories } from "@/lib/data/categories";
import { cities, searchCities } from "@/lib/data/cities";
import { buildSearchUrl } from "@/lib/search";
import CategoryIcon, { CategoryIconBadge } from "@/components/icons/CategoryIcon";

type Props = {
  defaultCategory?: string;
  defaultQuery?: string;
  defaultCity?: string;
  compact?: boolean;
  dark?: boolean;
};

export default function SearchBox({
  defaultCategory = "",
  defaultQuery = "",
  defaultCity = "",
  compact = false,
  dark = false,
}: Props) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(
    categories.find((c) => c.slug === defaultCategory) ?? categories[0]
  );
  const [searchQuery, setSearchQuery] = useState(defaultQuery);
  const [location, setLocation] = useState(defaultCity);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);

  const filteredCities = location.trim()
    ? searchCities(location, 8)
    : cities.slice(0, 8);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(
      buildSearchUrl({
        q: searchQuery || undefined,
        kategori: selectedCategory.slug,
        sehir: location || undefined,
      })
    );
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative mx-auto w-full border bg-card shadow-[var(--shadow-card)] ${
        isDropdownOpen || showCitySuggestions ? "z-50" : ""
      } ${dark ? "border-white/15" : "border-border"} ${
        compact ? "rounded-md p-2" : "max-w-3xl rounded-md p-2 sm:p-1.5"
      }`}
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <div className={`relative sm:border-r ${dark ? "sm:border-white/20" : "sm:border-border"}`}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex w-full items-center gap-2 rounded-lg px-4 py-3 text-left transition-colors sm:w-auto sm:min-w-[180px] sm:py-3.5 ${
              dark ? "hover:bg-card/10" : "hover:bg-accent"
            }`}
          >
            <CategoryIconBadge
              slug={selectedCategory.slug}
              variant={dark ? "light" : "default"}
            />
            <span className="flex-1 text-sm font-medium text-foreground">
              {selectedCategory.name}
            </span>
            <svg
              className={`h-4 w-4 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setIsDropdownOpen(false)}
                aria-hidden
              />
              <div className="absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-y-auto border border-border bg-card py-2 shadow-lg sm:left-2 sm:w-56">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    type="button"
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsDropdownOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm transition-colors hover:bg-accent ${
                      selectedCategory.slug === cat.slug
                        ? "bg-primary-light font-medium text-primary"
                        : "text-foreground"
                    }`}
                  >
                    <CategoryIcon slug={cat.slug} size={16} className="text-primary" />
                    {cat.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex flex-1 items-center gap-2 px-2 sm:px-4">
          <svg className="hidden h-5 w-5 shrink-0 text-muted-foreground sm:block" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Hangi hizmeti arıyorsun?"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none sm:py-3.5"
          />
        </div>

        <div className={`relative hidden items-center gap-2 border-l px-4 lg:flex ${dark ? "border-white/20" : "border-border"}`}>
          <svg className="h-5 w-5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <input
            type="text"
            placeholder="Şehir"
            value={location}
            onChange={(e) => {
              setLocation(e.target.value);
              setShowCitySuggestions(true);
            }}
            onFocus={() => setShowCitySuggestions(true)}
            onBlur={() => setTimeout(() => setShowCitySuggestions(false), 150)}
            className="w-32 bg-transparent py-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          {showCitySuggestions && filteredCities.length > 0 && (
            <div className="absolute left-0 top-full z-50 mt-1 max-h-56 w-48 overflow-y-auto border border-border bg-card py-1 shadow-lg">
              {filteredCities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onMouseDown={() => {
                    setLocation(city);
                    setShowCitySuggestions(false);
                  }}
                  className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-accent"
                >
                  {city}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-primary-dark sm:rounded-md"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          Usta Bul
        </button>
      </div>
    </form>
  );
}
