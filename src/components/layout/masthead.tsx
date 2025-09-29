import Image from "next/image";

export function Masthead() {
  return (
    <div className="w-full bg-gray-800">
      <Image
        src="https://res.cloudinary.com/dizk1uwv3/image/upload/v1759070077/Hungphuc/masthead-hung-phuc.png"
        alt="Masthead"
        width={4400} 
        height={40} 
        className="w-full h-auto"
        priority
      />
    </div>
  );
}
