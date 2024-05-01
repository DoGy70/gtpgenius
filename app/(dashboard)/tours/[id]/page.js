import TourInfo from "@/components/TourInfo";
import { getSingleTour } from "@/utils/actions";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import axios from "axios";
const url = `https://api.unsplash.com/search/photos?client_id=${process.env.UNSPLASH_API_KEY}&query=`;

async function SingleTourPage({ params }) {
  const tour = await getSingleTour(params.id);

  if (!tour) {
    redirect("/tours");
  }

  const { data } = await axios.get(`${url}${tour.city}`);
  const tourImage = data?.results[0]?.urls?.raw;

  return (
    <div className="sm:py-12 lg:py-0">
      <Link href="/tours" className="btn btn-secondary mb-12">
        back to tours
      </Link>
      {tourImage ? (
        <div>
          <Image
            src={tourImage}
            width={300}
            height={300}
            className="rounded-xl shadow-xl mb-16 h-96 w-96 object-cover"
            alt={tour.title}
            unoptimized
          />
        </div>
      ) : null}
      <TourInfo tour={tour} />
    </div>
  );
}
export default SingleTourPage;
