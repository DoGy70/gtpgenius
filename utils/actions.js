"use server";
import OpenAI from "openai";
import prisma from "./db";
import { revalidatePath } from "next/cache";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateChatResponse(chatMessages) {
  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "you are a helpful assistant" },
        ...chatMessages,
      ],
      model: "gpt-3.5-turbo",
      temperature: 0,
      max_tokens: 100,
    });
    return {
      message: response.choices[0].message,
      tokens: response.usage.total_tokens,
    };
  } catch (error) {
    return null;
  }
}

export async function getExistingTour({ city, country }) {
  return prisma.tour.findUnique({
    where: {
      city_country: {
        city: city.toLowerCase(),
        country: country.toLowerCase(),
      },
    },
  });
}

export async function generateTourResponse({ city, country }) {
  const query = `Find a ${city} in this ${country}. If ${city} in this ${country} exists, create a list of things families can do in this ${city}, ${country}. Once you have a list, create a one-day tour. Response should be in the following JSON format: {
    "tour": {
      "city": "${city.toLowerCase()}",
      "country": "${country.toLowerCase()}",
      "title": "title of the tour",
      "description": "description of the city and tour",
      "stops": ["stop name", "stop name", "stop name"]
    }
  }
  If you can't find info on exact ${city}, or ${city} does not exists, or it's population is less than 1, or is not located in the following ${country}, return { "tour": null }, with no additional characters.`;

  try {
    const response = await openai.chat.completions.create({
      messages: [
        { role: "system", content: "you are a tour guide" },
        { role: "user", content: query },
      ],
      model: "gpt-3.5-turbo",
      temperature: 0,
    });

    const tourData = JSON.parse(response.choices[0].message.content);

    console.log(tourData);

    if (!tourData.tour) {
      return null;
    }

    return { tour: tourData.tour, tokens: response.usage.total_tokens };
  } catch (error) {
    console.log(error);
    return null;
  }
}

export async function createNewTour(tour) {
  return prisma.tour.create({
    data: tour,
  });
}

export async function getAllTours(searchTerm) {
  if (!searchTerm) {
    const tours = await prisma.tour.findMany({
      orderBy: {
        city: "asc",
      },
    });

    return tours;
  }

  const tours = await prisma.tour.findMany({
    where: {
      OR: [
        {
          city: {
            contains: searchTerm,
          },
        },
        {
          country: {
            contains: searchTerm,
          },
        },
      ],
    },
    orderBy: {
      city: "asc",
    },
  });

  return tours;
}

export async function getSingleTour(id) {
  return await prisma.tour.findUnique({
    where: {
      id,
    },
  });
}

export async function generateTourImage({ city, country }) {
  try {
    const tourImage = await openai.images.generate({
      prompt: `a panoramic view of ${city} ${country}`,
      n: 1,
      size: "512x512",
    });

    return tourImage?.data[0]?.url;
  } catch (error) {
    return null;
  }
}

export async function fetchUserTokensById(clerkId) {
  const result = await prisma.token.findUnique({
    where: {
      clerkId,
    },
  });
  return result?.tokens;
}

export async function generateUserTokens(clerkId) {
  const result = await prisma.token.create({
    data: {
      clerkId,
    },
  });

  return result?.tokens;
}

export async function fetchOrGenerateTokens(clerkId) {
  const result = await fetchUserTokensById(clerkId);

  if (result) {
    return result;
  }

  return (await generateUserTokens(clerkId)).tokens;
}

export async function subtractTokens(clerkId, tokens) {
  const result = await prisma.token.update({
    where: {
      clerkId,
    },
    data: {
      tokens: {
        decrement: tokens,
      },
    },
  });
  revalidatePath("/profile");
  return result.tokens;
}
