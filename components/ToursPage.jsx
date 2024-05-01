"use client";

import { getAllTours } from "@/utils/actions";
import { useQuery } from "@tanstack/react-query";
import ToursList from "./ToursList";
import { useState } from "react";

function ToursPage() {
  const [searchValue, setSearchValue] = useState("");

  const { data, isPending } = useQuery({
    queryKey: ["tours", searchValue],
    queryFn: () => getAllTours(searchValue),
  });

  return (
    <section className="py-10 lg:py-0">
      <form className="max-w-lg mb-12">
        <div className="join w-full">
          <input
            type="text"
            placeholder="enter city or country here..."
            className="input input-bordered join-item w-full"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value.toLowerCase())}
          />
          <button
            type="button"
            className="btn btn-primary join-item"
            disabled={isPending}
            onClick={() => setSearchValue("")}
          >
            {isPending ? "please wait..." : "reset"}
          </button>
        </div>
      </form>
      {isPending ? (
        <span className="loading"></span>
      ) : (
        <ToursList data={data} />
      )}
    </section>
  );
}
export default ToursPage;
