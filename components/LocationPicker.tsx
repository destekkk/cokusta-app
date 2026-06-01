"use client";

import { cities, getDistricts } from "@/lib/data/cities";

type Props = {
  city: string;
  district: string;
  onCityChange: (city: string) => void;
  onDistrictChange: (district: string) => void;
  disabled?: boolean;
  cityLabel?: string;
  districtLabel?: string;
};

export default function LocationPicker({
  city,
  district,
  onCityChange,
  onDistrictChange,
  disabled = false,
  cityLabel = "İl",
  districtLabel = "İlçe",
}: Props) {
  const districts = city ? getDistricts(city) : [];

  return (
    <div className="flex flex-wrap gap-3">
      <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-muted-foreground">
        {cityLabel}
        <select
          value={city}
          disabled={disabled}
          onChange={(e) => {
            onCityChange(e.target.value);
            onDistrictChange("");
          }}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground disabled:opacity-50"
        >
          <option value="">İl seçin</option>
          {cities.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-xs text-muted-foreground">
        {districtLabel}
        <select
          value={district}
          disabled={disabled || !city}
          onChange={(e) => onDistrictChange(e.target.value)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm text-foreground disabled:opacity-50"
        >
          <option value="">İlçe seçin</option>
          {districts.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
