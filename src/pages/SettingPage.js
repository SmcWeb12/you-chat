import React, { useState } from "react";

const wallpapers = [
  "https://wallpapers.com/images/hd/whatsapp-chat-background-fb34cc4b2hg9lmix.jpg",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQxdb1u5KUZq_RW3sUBxOB1TX-1EHHSSUhP_fK_QAacipODZFdOCh0lZeOzgc2EAYHKMR8&usqp=CAU",
  "https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTJEy3soCR2owbCGqYkAi9chp4qYSUGfdpNQg&s",
  "https://wallpapers.com/images/hd/cosmic-love-couple-qvafkg117vm0oyik.jpg",
  "https://e1.pxfuel.com/desktop-wallpaper/316/959/desktop-wallpaper-100-16-on-pinterest-vivo-v5-thumbnail.jpg",
  "https://img.freepik.com/premium-photo/vertical-hacker-with-laptop-wings-dark-background_924727-1738.jpg",
  "https://i.pinimg.com/736x/a8/0c/c3/a80cc3a0a3acd9e4db805fb13bbb1524.jpg",
  "https://wallpapers.com/images/hd/hacker-circuit-board-9cptxe43ejpsp3st.jpg",
];

const SettingsPage = () => {
  const [selectedWallpaper, setSelectedWallpaper] = useState(
    localStorage.getItem("chatWallpaper") || wallpapers[0]
  );

  const handleWallpaperSelect = (wallpaper) => {
    setSelectedWallpaper(wallpaper);
    localStorage.setItem("chatWallpaper", wallpaper);
  };

  return (
    <div className="settings-page">
      <h1 className="text-2xl font-semibold mb-4">Settings Page</h1>
      <p className="text-gray-500 mb-6">Select a background wallpaper for your chat page:</p>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {wallpapers.map((wallpaper, index) => (
          <div
            key={index}
            className={`p-1 border-2 rounded-lg ${
              selectedWallpaper === wallpaper ? "border-blue-500" : "border-gray-200"
            }`}
            onClick={() => handleWallpaperSelect(wallpaper)}
          >
            <img
              src={wallpaper}
              alt={`Wallpaper ${index + 1}`}
              className="w-full h-32 object-cover rounded-md cursor-pointer"
            />
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-400 mt-4">
        * Your selection will be applied to your chat page automatically.
      </p>
    </div>
  );
};

export default SettingsPage;
