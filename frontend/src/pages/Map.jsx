import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { FaHeart, FaComment } from "react-icons/fa";
import LoggedNavbar from "../components/LoggedNavbar";

const generateRandomComments = () => {
  const users = ["Alice", "Bob", "Charlie", "Diana", "Edward"];
  const commentsPool = [
    "Nice!",
    "Cool place!",
    "Highly recommended.",
    "Awesome spot.",
    "Loved it!",
    "Had a great time here.",
    "Worth visiting.",
    "Beautiful place!",
    "Amazing experience.",
    "Would go again!",
  ];
  const commentsArray = [];
  const numComments = Math.floor(Math.random() * 5) + 1;

  for (let i = 0; i < numComments; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomComment =
      commentsPool[Math.floor(Math.random() * commentsPool.length)];
    commentsArray.push({ user: randomUser, text: randomComment });
  }

  return commentsArray;
};

const generateRandomLikes = () => {
  return Math.floor(Math.random() * 100);
};

const MapsPage = () => {
  const locationData = useLocation();
  const mapRef = useRef(null);
  const markerRef = useRef(null);

  const [location, setLocation] = useState({
    title: "Default Title",
    imageUrl: "",
    likes: generateRandomLikes(),
    description: "Default description",
    comments: generateRandomComments(),
    lat: 40.785091,
    long: -73.968285,
  });

  // Update the location state when the component mounts
  useEffect(() => {
    console.log("Location data received in MapsPage:", locationData.state);

    if (locationData.state) {
      const { title, imageUrl, data } = locationData.state;

      // Access Lat and Long from within the `data` object
      const { Lat, Long } = data;

      console.log("Using Lat, Long:", Lat, Long);

      setLocation({
        title: title || "Default Title",
        imageUrl: imageUrl || "",
        likes: generateRandomLikes(),
        description: data.description || "Default description",
        comments: generateRandomComments(),
        lat: Lat || 40.785091, // Use `Lat` from `data`
        long: Long || -73.968285, // Use `Long` from `data`
      });
    }
  }, [locationData.state]);

  // Load the Google Maps script and initialize the map after location is updated
  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=AIzaSyAL1kzmsE0Hzl28qm5Trp1_s76quJnsHEY`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onload = () => {
      // Initialize the map with updated location
      mapRef.current = new window.google.maps.Map(
        document.getElementById("map"),
        {
          center: { lat: location.lat, lng: location.long },
          zoom: 12,
        },
      );

      // Initialize the marker
      markerRef.current = new window.google.maps.Marker({
        position: { lat: location.lat, lng: location.long },
        map: mapRef.current,
        title: location.title,
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [location.lat, location.long]);

  // Update marker and map center whenever location's lat or long changes
  useEffect(() => {
    if (mapRef.current && markerRef.current) {
      // Set new marker position
      markerRef.current.setPosition({ lat: location.lat, lng: location.long });
      // Center the map to new position
      mapRef.current.setCenter({ lat: location.lat, lng: location.long });
    }
    console.log("Updated location:", location);
  }, [location.lat, location.long]);

  return (
    <>
      <LoggedNavbar />
      <div className="flex h-screen bg-lighter-base-color pt-20">
        {/* Map */}
        <div id="map" className="h-full w-2/3"></div>

        {/* Side container */}
        <div className="h-full w-1/3 overflow-scroll overflow-y-auto bg-lighter-base-color p-6 shadow-lg">
          <h2 className="mb-4 text-2xl">{location.title}</h2>

          <img
            src={location.imageUrl}
            alt={location.title}
            className="mb-4 rounded-lg shadow-md"
          />

          <div className="mb-4 flex items-center gap-2 text-lg">
            <FaHeart className="text-rose-500" />
            <span className="font-semibold">Likes: {location.likes}</span>
          </div>

          <p className="mb-4 text-lg">{location.description}</p>

          <h3 className="mb-2 text-xl">
            <FaComment className="mr-2 inline-block text-emerald-500" />{" "}
            Comments
          </h3>
          <ul className="space-y-4">
            {location.comments.map((comment, index) => (
              <li key={index} className="rounded-lg bg-white p-4 shadow-sm">
                <p className="font-semibold">{comment.user}</p>
                <p>{comment.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default MapsPage;
