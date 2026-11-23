import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";

const DEFAULT_CATEGORIES = [
  {
    name: "Automotive",
    slug: "automotive",
    icon: "🚗",
    recommended: [
      { label: "Car Electronics", to: "/category/automotive?sub=electronics", art: "screen" },
      { label: "Interior Care", to: "/category/automotive?sub=interior", art: "spray" },
      { label: "Exterior Parts", to: "/category/automotive?sub=exterior", art: "car" },
      { label: "Tools & Gauges", to: "/category/automotive?sub=tools", art: "wrench" },
      { label: "Car Chargers", to: "/category/automotive?sub=chargers", art: "plug" },
      { label: "Dash Cams", to: "/category/automotive?sub=dash-cams", art: "camera" },
      { label: "Seat Covers", to: "/category/automotive?sub=seat-covers", art: "seat" },
    ],
    brands: ["Baseus", "70mai", "Michelin", "Bosch", "Philips", "Ugreen", "3M"],
  },
  {
    name: "Appliances",
    slug: "appliances",
    icon: "🔌",
    recommended: [
      { label: "Air Fryers", to: "/category/appliances?sub=air-fryers", art: "fryer" },
      { label: "Coffee Makers", to: "/category/appliances?sub=coffee", art: "coffee" },
      { label: "Robot Vacuums", to: "/category/appliances?sub=vacuums", art: "vacuum" },
      { label: "Blenders", to: "/category/appliances?sub=blenders", art: "blender" },
      { label: "Rice Cookers", to: "/category/appliances?sub=rice-cookers", art: "pot" },
      { label: "Garment Steamers", to: "/category/appliances?sub=steamers", art: "iron" },
      { label: "Mini Fridges", to: "/category/appliances?sub=fridges", art: "fridge" },
    ],
    brands: ["Dreame", "Philips", "Xiaomi", "Ninja", "Deerma", "Bear", "Midea"],
  },
  {
    name: "Women's Clothing",
    slug: "womens-clothing",
    icon: "👗",
    recommended: [
      { label: "Dresses", to: "/category/womens-clothing?sub=dresses", art: "dress" },
      { label: "Tops & Tees", to: "/category/womens-clothing?sub=tops", art: "shirt" },
      { label: "Activewear", to: "/category/womens-clothing?sub=activewear", art: "hoodie" },
      { label: "Outerwear", to: "/category/womens-clothing?sub=outerwear", art: "jacket" },
      { label: "Loungewear", to: "/category/womens-clothing?sub=loungewear", art: "pants" },
      { label: "Skirts", to: "/category/womens-clothing?sub=skirts", art: "skirt" },
      { label: "Swimwear", to: "/category/womens-clothing?sub=swimwear", art: "bag" },
    ],
    brands: ["Cider", "Halara", "Shein", "Zara", "Lululemon", "Mango", "H&M"],
  },
  {
    name: "Men's Clothing",
    slug: "mens-clothing",
    icon: "👔",
    recommended: [
      { label: "Casual Shirts", to: "/category/mens-clothing?sub=shirts", art: "shirt" },
      { label: "Hoodies & Sweats", to: "/category/mens-clothing?sub=hoodies", art: "hoodie" },
      { label: "Trousers & Jeans", to: "/category/mens-clothing?sub=pants", art: "pants" },
      { label: "Jackets", to: "/category/mens-clothing?sub=jackets", art: "jacket" },
      { label: "Polo Shirts", to: "/category/mens-clothing?sub=polos", art: "polo" },
      { label: "Shorts", to: "/category/mens-clothing?sub=shorts", art: "shorts" },
      { label: "Workwear", to: "/category/mens-clothing?sub=workwear", art: "vest" },
    ],
    brands: ["Uniqlo", "Nike", "Jack & Jones", "Dickies", "Levi's", "Adidas", "Carhartt"],
  },
  {
    name: "Toys & Games",
    slug: "toys-games",
    icon: "🎮",
    recommended: [
      { label: "Building Blocks", to: "/category/toys-games?sub=blocks", art: "blocks" },
      { label: "Action Figures", to: "/category/toys-games?sub=figures", art: "robot" },
      { label: "Board & Card Games", to: "/category/toys-games?sub=board-games", art: "dice" },
      { label: "RC & Drones", to: "/category/toys-games?sub=rc", art: "drone" },
      { label: "Plush Toys", to: "/category/toys-games?sub=plush", art: "bear" },
      { label: "Puzzles", to: "/category/toys-games?sub=puzzles", art: "puzzle" },
      { label: "Collectibles", to: "/category/toys-games?sub=collectibles", art: "trophy" },
    ],
    brands: ["Hasbro", "LEGO", "Bandai", "KAYOU", "Mattel", "Funko", "DJI"],
  },
  {
    name: "Beauty & Health",
    slug: "beauty-health",
    icon: "✨",
    recommended: [
      { label: "Skincare", to: "/category/beauty-health?sub=skincare", art: "bottle" },
      { label: "Makeup & Brushes", to: "/category/beauty-health?sub=makeup", art: "brush" },
      { label: "Hair Care & Tools", to: "/category/beauty-health?sub=hair", art: "dryer" },
      { label: "Wellness & Massage", to: "/category/beauty-health?sub=wellness", art: "heart" },
      { label: "Serums & Cleansers", to: "/category/beauty-health?sub=serums", art: "drop" },
      { label: "Fragrances", to: "/category/beauty-health?sub=fragrances", art: "perfume" },
      { label: "Nail Care", to: "/category/beauty-health?sub=nails", art: "sparkle" },
    ],
    brands: ["CeraVe", "Anua", "Dyson", "L'Oreal", "COSRX", "The Ordinary", "La Roche"],
  },
  {
    name: "Home & Living",
    slug: "home-living",
    icon: "🏠",
    recommended: [
      { label: "Bedding Sets & Silk", to: "/category/home-living?sub=bedding", art: "pillow" },
      { label: "Drinkware & Barware", to: "/category/home-living?sub=drinkware", art: "cup" },
      { label: "Cookware & Bakeware", to: "/category/home-living?sub=cookware", art: "pot" },
      { label: "Mirrors & Vases", to: "/category/home-living?sub=decor", art: "vase" },
      { label: "Food Storage", to: "/category/home-living?sub=storage", art: "jar" },
      { label: "Rugs & Carpets", to: "/category/home-living?sub=rugs", art: "rug" },
      { label: "Curtains & Window", to: "/category/home-living?sub=curtains", art: "curtain" },
    ],
    brands: ["TIMEMORE", "HOMCOM", "IKEA", "Potdemiel", "Muji", "Joseph Joseph", "Le Creuset"],
  },
  {
    name: "Cell Phones & Accessories",
    slug: "cell-phones-accessories",
    icon: "📱",
    recommended: [
      { label: "Phone Cases", to: "/category/cell-phones-accessories?sub=cases", art: "screen" },
      { label: "Screen Protectors", to: "/category/cell-phones-accessories?sub=protectors", art: "screen" },
      { label: "Fast Chargers", to: "/category/cell-phones-accessories?sub=chargers", art: "plug" },
      { label: "Power Banks", to: "/category/cell-phones-accessories?sub=power-banks", art: "plug" },
      { label: "Cables & Adapters", to: "/category/cell-phones-accessories?sub=cables", art: "plug" },
      { label: "Mounts & Holders", to: "/category/cell-phones-accessories?sub=mounts", art: "camera" },
      { label: "Smartphones", to: "/category/cell-phones-accessories?sub=phones", art: "screen" },
    ],
    brands: ["Apple", "Samsung", "Xiaomi", "Baseus", "Ugreen", "Anker", "Spigen"],
  },
  {
    name: "Jewelry & Accessories",
    slug: "jewelry-accessories",
    icon: "💍",
    recommended: [
      { label: "Necklaces & Pendants", to: "/category/jewelry-accessories?sub=necklaces", art: "necklace" },
      { label: "Rings & Bracelets", to: "/category/jewelry-accessories?sub=rings", art: "ring" },
      { label: "Watches", to: "/category/jewelry-accessories?sub=watches", art: "watch" },
      { label: "Sunglasses", to: "/category/jewelry-accessories?sub=sunglasses", art: "glasses" },
      { label: "Earrings", to: "/category/jewelry-accessories?sub=earrings", art: "gem" },
      { label: "Belts & Wallets", to: "/category/jewelry-accessories?sub=wallets", art: "wallet" },
      { label: "Hair Accessories", to: "/category/jewelry-accessories?sub=hair-acc", art: "crown" },
    ],
    brands: ["Pandora", "Casio", "Swarovski", "Fossil", "Seiko", "Ray-Ban", "Coach"],
  },
  {
    name: "Electronics",
    slug: "electronics",
    icon: "📷",
    recommended: [
      { label: "Wireless Earbuds", to: "/category/electronics?sub=earbuds", art: "screen" },
      { label: "Smartwatches", to: "/category/electronics?sub=smartwatches", art: "watch" },
      { label: "Cameras & Lenses", to: "/category/electronics?sub=cameras", art: "camera" },
      { label: "Speakers & Audio", to: "/category/electronics?sub=audio", art: "screen" },
      { label: "Laptop Accessories", to: "/category/electronics?sub=laptop-acc", art: "screen" },
      { label: "LED & Smart Lights", to: "/category/electronics?sub=lighting", art: "plug" },
      { label: "Cables & Hubs", to: "/category/electronics?sub=hubs", art: "plug" },
    ],
    brands: ["Sony", "JBL", "Logitech", "Ugreen", "Baseus", "DJI", "Canon"],
  },
  {
    name: "Shoes",
    slug: "shoes",
    icon: "👟",
    recommended: [
      { label: "Sneakers", to: "/category/shoes?sub=sneakers", art: "shirt" },
      { label: "Running Shoes", to: "/category/shoes?sub=running", art: "shirt" },
      { label: "Boots", to: "/category/shoes?sub=boots", art: "jacket" },
      { label: "Sandals & Slides", to: "/category/shoes?sub=sandals", art: "shorts" },
      { label: "Loafers & Dress", to: "/category/shoes?sub=loafers", art: "vest" },
      { label: "Slippers", to: "/category/shoes?sub=slippers", art: "pillow" },
      { label: "Shoe Care & Insoles", to: "/category/shoes?sub=shoe-care", art: "spray" },
    ],
    brands: ["Nike", "Adidas", "New Balance", "Puma", "Vans", "Converse", "Crocs"],
  },
  {
    name: "Tools & Home Improvement",
    slug: "tools-home-improvement",
    icon: "🛠️",
    recommended: [
      { label: "Power Drills & Drivers", to: "/category/tools-home-improvement?sub=drills", art: "wrench" },
      { label: "Hand Tools", to: "/category/tools-home-improvement?sub=hand-tools", art: "wrench" },
      { label: "Measuring & Gauges", to: "/category/tools-home-improvement?sub=measuring", art: "screen" },
      { label: "Bathroom Fixtures", to: "/category/tools-home-improvement?sub=bathroom", art: "pot" },
      { label: "Lighting & Switches", to: "/category/tools-home-improvement?sub=lighting", art: "plug" },
      { label: "Hardware & Fasteners", to: "/category/tools-home-improvement?sub=hardware", art: "jar" },
      { label: "Safety Gear", to: "/category/tools-home-improvement?sub=safety", art: "vest" },
    ],
    brands: ["Bosch", "Makita", "DeWalt", "Xiaomi", "3M", "Stanley", "Hikvision"],
  },
  {
    name: "Furniture",
    slug: "furniture",
    icon: "🛋️",
    recommended: [
      { label: "Office Chairs", to: "/category/furniture?sub=office-chairs", art: "seat" },
      { label: "Desks & Tables", to: "/category/furniture?sub=desks", art: "rug" },
      { label: "Sofas & Armchairs", to: "/category/furniture?sub=sofas", art: "pillow" },
      { label: "Storage & Cabinets", to: "/category/furniture?sub=storage", art: "jar" },
      { label: "Shelves & Racks", to: "/category/furniture?sub=shelves", art: "curtain" },
      { label: "Outdoor Furniture", to: "/category/furniture?sub=outdoor", art: "seat" },
      { label: "Bean Bags & Ottomans", to: "/category/furniture?sub=ottomans", art: "pillow" },
    ],
    brands: ["IKEA", "HOMCOM", "FlexiSpot", "Herman Miller", "Muji", "Songmics", "Wayfair"],
  },
  {
    name: "Sports & Outdoors",
    slug: "sports-outdoors",
    icon: "🏀",
    recommended: [
      { label: "Fitness & Gym Gear", to: "/category/sports-outdoors?sub=fitness", art: "trophy" },
      { label: "Camping & Hiking", to: "/category/sports-outdoors?sub=camping", art: "bag" },
      { label: "Cycling Gear", to: "/category/sports-outdoors?sub=cycling", art: "camera" },
      { label: "Yoga & Pilates", to: "/category/sports-outdoors?sub=yoga", art: "rug" },
      { label: "Water Sports", to: "/category/sports-outdoors?sub=water-sports", art: "drop" },
      { label: "Team Sports", to: "/category/sports-outdoors?sub=team-sports", art: "trophy" },
      { label: "Outdoor Hydration", to: "/category/sports-outdoors?sub=hydration", art: "cup" },
    ],
    brands: ["Nike", "Adidas", "Decathlon", "Columbia", "The North Face", "Garmin", "Under Armour"],
  },
  {
    name: "Pet Supplies",
    slug: "pet-supplies",
    icon: "🐶",
    recommended: [
      { label: "Pet Beds & Mats", to: "/category/pet-supplies?sub=beds", art: "pillow" },
      { label: "Feeders & Bowls", to: "/category/pet-supplies?sub=feeders", art: "cup" },
      { label: "Collars & Leashes", to: "/category/pet-supplies?sub=collars", art: "necklace" },
      { label: "Pet Toys", to: "/category/pet-supplies?sub=toys", art: "bear" },
      { label: "Grooming & Bath", to: "/category/pet-supplies?sub=grooming", art: "brush" },
      { label: "Pet Carriers", to: "/category/pet-supplies?sub=carriers", art: "bag" },
      { label: "Litter & Cleanup", to: "/category/pet-supplies?sub=cleanup", art: "jar" },
    ],
    brands: ["Petkit", "Xiaomi", "Kong", "Furbo", "Royal Canin", "Trixie", "Whiskas"],
  },
  {
    name: "Hair Extensions & Wigs",
    slug: "hair-extensions-wigs",
    icon: "💇",
    recommended: [
      { label: "Lace Front Wigs", to: "/category/hair-extensions-wigs?sub=lace-wigs", art: "crown" },
      { label: "Hair Bundles", to: "/category/hair-extensions-wigs?sub=bundles", art: "sparkle" },
      { label: "Clip-In Extensions", to: "/category/hair-extensions-wigs?sub=clip-ins", art: "brush" },
      { label: "Braiding Hair", to: "/category/hair-extensions-wigs?sub=braiding", art: "sparkle" },
      { label: "Closures & Frontals", to: "/category/hair-extensions-wigs?sub=closures", art: "crown" },
      { label: "Wig Caps & Glue", to: "/category/hair-extensions-wigs?sub=accessories", art: "bottle" },
      { label: "Hair Styling Tools", to: "/category/hair-extensions-wigs?sub=styling", art: "dryer" },
    ],
    brands: ["Unice", "Nadula", "Luvme", "Ali Pearl", "KinkyCurly", "Sensationnel", "Outre"],
  },
  {
    name: "Office & School Supplies",
    slug: "office-school-supplies",
    icon: "🖥️",
    recommended: [
      { label: "Notebooks & Planners", to: "/category/office-school-supplies?sub=notebooks", art: "jar" },
      { label: "Pens & Markers", to: "/category/office-school-supplies?sub=pens", art: "brush" },
      { label: "Desk Organizers", to: "/category/office-school-supplies?sub=organizers", art: "jar" },
      { label: "Calculators & Tech", to: "/category/office-school-supplies?sub=calculators", art: "screen" },
      { label: "Labels & Tape", to: "/category/office-school-supplies?sub=labels", art: "pot" },
      { label: "Backpacks & Pouches", to: "/category/office-school-supplies?sub=backpacks", art: "bag" },
      { label: "Presentation Gear", to: "/category/office-school-supplies?sub=presentation", art: "screen" },
    ],
    brands: ["Muji", "Moleskine", "Pilot", "Stabilo", "Casio", "3M", "Deli"],
  },
  {
    name: "Food & Grocery",
    slug: "food-grocery",
    icon: "🥫",
    recommended: [
      { label: "Coffee & Tea", to: "/category/food-grocery?sub=coffee-tea", art: "cup" },
      { label: "Snacks & Sweets", to: "/category/food-grocery?sub=snacks", art: "jar" },
      { label: "Spices & Seasonings", to: "/category/food-grocery?sub=spices", art: "bottle" },
      { label: "Oils & Condiments", to: "/category/food-grocery?sub=condiments", art: "bottle" },
      { label: "Noodles & Grains", to: "/category/food-grocery?sub=grains", art: "pot" },
      { label: "Baking Ingredients", to: "/category/food-grocery?sub=baking", art: "pot" },
      { label: "Gift Boxes", to: "/category/food-grocery?sub=gifts", art: "bag" },
    ],
    brands: ["TIMEMORE", "Nestle", "Kikkoman", "Lindt", "Twinings", "Barilla", "S&B"],
  },
  {
    name: "Bags & Luggage",
    slug: "bags-luggage",
    icon: "🧳",
    recommended: [
      { label: "Backpacks", to: "/category/bags-luggage?sub=backpacks", art: "bag" },
      { label: "Carry-On & Suitcases", to: "/category/bags-luggage?sub=luggage", art: "bag" },
      { label: "Crossbody & Shoulder", to: "/category/bags-luggage?sub=crossbody", art: "wallet" },
      { label: "Tote Bags", to: "/category/bags-luggage?sub=totes", art: "bag" },
      { label: "Laptop Bags", to: "/category/bags-luggage?sub=laptop-bags", art: "screen" },
      { label: "Travel Organizers", to: "/category/bags-luggage?sub=organizers", art: "pillow" },
      { label: "Duffel Bags", to: "/category/bags-luggage?sub=duffels", art: "bag" },
    ],
    brands: ["Samsonite", "Herschel", "Fjallraven", "Coach", "Baseus", "Tigernu", "Bange"],
  },
  {
    name: "Baby & Maternity",
    slug: "baby-maternity",
    icon: "🍼",
    recommended: [
      { label: "Feeding & Bottles", to: "/category/baby-maternity?sub=feeding", art: "bottle" },
      { label: "Baby Clothing", to: "/category/baby-maternity?sub=clothing", art: "shirt" },
      { label: "Diapering & Care", to: "/category/baby-maternity?sub=diapering", art: "drop" },
      { label: "Nursery & Bedding", to: "/category/baby-maternity?sub=nursery", art: "pillow" },
      { label: "Strollers & Carriers", to: "/category/baby-maternity?sub=strollers", art: "car" },
      { label: "Baby Toys", to: "/category/baby-maternity?sub=toys", art: "bear" },
      { label: "Maternity Wear", to: "/category/baby-maternity?sub=maternity", art: "dress" },
    ],
    brands: ["Philips Avent", "Pigeon", "Pampers", "Mustela", "Chicco", "Fisher-Price", "Tommee Tippee"],
  },
  {
    name: "Novelty & Special Use",
    slug: "novelty-special-use",
    icon: "🎭",
    recommended: [
      { label: "Costumes & Cosplay", to: "/category/novelty-special-use?sub=costumes", art: "crown" },
      { label: "Party Supplies", to: "/category/novelty-special-use?sub=party", art: "sparkle" },
      { label: "Gag & Novelty Gifts", to: "/category/novelty-special-use?sub=gifts", art: "dice" },
      { label: "Holiday Decor", to: "/category/novelty-special-use?sub=holiday", art: "sparkle" },
      { label: "Props & Masks", to: "/category/novelty-special-use?sub=props", art: "glasses" },
      { label: "Event Banners", to: "/category/novelty-special-use?sub=banners", art: "curtain" },
      { label: "Themed Apparel", to: "/category/novelty-special-use?sub=apparel", art: "hoodie" },
    ],
    brands: ["Rubie's", "Funko", "Amscan", "Party City", "Kayou", "Bandai", "Morphsuits"],
  },
  {
    name: "Motorcycles & Powersports",
    slug: "motorcycles-powersports",
    icon: "🏍️",
    recommended: [
      { label: "Helmets & Visors", to: "/category/motorcycles-powersports?sub=helmets", art: "crown" },
      { label: "Riding Jackets & Gloves", to: "/category/motorcycles-powersports?sub=gear", art: "jacket" },
      { label: "Motorcycle Parts", to: "/category/motorcycles-powersports?sub=parts", art: "wrench" },
      { label: "Intercoms & Mounts", to: "/category/motorcycles-powersports?sub=electronics", art: "camera" },
      { label: "LED Lights & Signals", to: "/category/motorcycles-powersports?sub=lights", art: "plug" },
      { label: "Locks & Security", to: "/category/motorcycles-powersports?sub=security", art: "wrench" },
      { label: "ATV & Dirt Gear", to: "/category/motorcycles-powersports?sub=atv", art: "car" },
    ],
    brands: ["AGV", "Shoei", "Sena", "Cardo", "Alpinestars", "Dainese", "Givi"],
  },
  {
    name: "Business, Industry & Science",
    slug: "business-industry-science",
    icon: "🔬",
    recommended: [
      { label: "Lab & Testing Gear", to: "/category/business-industry-science?sub=lab", art: "screen" },
      { label: "3D Printers & Filaments", to: "/category/business-industry-science?sub=3d-printing", art: "drone" },
      { label: "Industrial Sensors", to: "/category/business-industry-science?sub=sensors", art: "plug" },
      { label: "Packaging & Shipping", to: "/category/business-industry-science?sub=packaging", art: "jar" },
      { label: "Work & Safety Apparel", to: "/category/business-industry-science?sub=safety", art: "vest" },
      { label: "Pneumatics & Motors", to: "/category/business-industry-science?sub=motors", art: "wrench" },
      { label: "Calibration Tools", to: "/category/business-industry-science?sub=calibration", art: "screen" },
    ],
    brands: ["Bambu Lab", "Creality", "Fluke", "3M", "Bosch", "Siemens", "Keysight"],
  },
  {
    name: "Arts, Crafts & Sewing",
    slug: "arts-crafts-sewing",
    icon: "🧵",
    recommended: [
      { label: "Sewing Machines & Needles", to: "/category/arts-crafts-sewing?sub=sewing", art: "iron" },
      { label: "Yarn & Knitting", to: "/category/arts-crafts-sewing?sub=yarn", art: "pillow" },
      { label: "Paints & Brushes", to: "/category/arts-crafts-sewing?sub=painting", art: "brush" },
      { label: "Fabrics & Textiles", to: "/category/arts-crafts-sewing?sub=fabrics", art: "curtain" },
      { label: "Beads & Jewelry Making", to: "/category/arts-crafts-sewing?sub=beads", art: "gem" },
      { label: "Paper & Scrapbooking", to: "/category/arts-crafts-sewing?sub=paper", art: "puzzle" },
      { label: "Craft Organizers", to: "/category/arts-crafts-sewing?sub=storage", art: "jar" },
    ],
    brands: ["Singer", "Brother", "DMC", "Cricut", "Winsor & Newton", "Tombow", "Fiskars"],
  },
  {
    name: "Books & Media",
    slug: "books-media",
    icon: "📚",
    recommended: [
      { label: "Fiction & Literature", to: "/category/books-media?sub=fiction", art: "jar" },
      { label: "Business & Self-Help", to: "/category/books-media?sub=business", art: "screen" },
      { label: "Manga & Graphic Novels", to: "/category/books-media?sub=manga", art: "puzzle" },
      { label: "Children's Books", to: "/category/books-media?sub=kids", art: "bear" },
      { label: "Textbooks & Study", to: "/category/books-media?sub=education", art: "jar" },
      { label: "Art & Design Books", to: "/category/books-media?sub=design", art: "brush" },
      { label: "Vinyl & Collectibles", to: "/category/books-media?sub=collectibles", art: "trophy" },
    ],
    brands: ["Penguin", "HarperCollins", "Viz Media", "O'Reilly", "Kodansha", "DK", "Scholastic"],
  },
];

function ItemVisual({ item, fallbackIcon }) {
  if (item.image) {
    return (
      <img
        src={item.image}
        alt={item.label}
        className="mb-2 h-14 w-14 sm:h-16 sm:w-16 object-contain transition group-hover:scale-105"
      />
    );
  }

  return (
    <div className="mb-2 flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center transition group-hover:scale-105">
      <svg viewBox="0 0 64 64" className="h-12 w-12 sm:h-14 sm:w-14" aria-hidden="true">
        {item.art === "shirt" && (
          <>
            <path d="M21 15h22l7 10-7 4v20H21V29l-7-4 7-10z" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
            <path d="M27 15c0 3 2.2 5 5 5s5-2 5-5" fill="#eff6ff" />
            <line x1="32" y1="20" x2="32" y2="49" stroke="#2563eb" strokeWidth="1.2" strokeDasharray="2 2" />
          </>
        )}
        {item.art === "hoodie" && (
          <>
            <path d="M20 16h24l7 11-6 4v18H19V31l-6-4 7-11z" fill="#f97316" stroke="#c2410c" strokeWidth="1.5" />
            <path d="M25 16c0 4 3 7 7 7s7-3 7-7" fill="#fff7ed" />
            <line x1="29" y1="24" x2="29" y2="34" stroke="#fff7ed" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="35" y1="24" x2="35" y2="34" stroke="#fff7ed" strokeWidth="1.5" strokeLinecap="round" />
          </>
        )}
        {item.art === "pants" && (
          <>
            <path d="M21 14h22l3 36H35l-3-21-3 21H18l3-36z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <line x1="21" y1="20" x2="43" y2="20" stroke="#93c5fd" strokeWidth="2" />
          </>
        )}
        {item.art === "jacket" && (
          <>
            <path d="M20 15h24l8 11-6 5v18H18V31l-6-5 8-11z" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
            <line x1="32" y1="15" x2="32" y2="49" stroke="#e2e8f0" strokeWidth="2" />
          </>
        )}
        {item.art === "polo" && (
          <>
            <path d="M21 15h22l7 10-7 4v20H21V29l-7-4 7-10z" fill="#10b981" stroke="#047857" strokeWidth="1.5" />
            <path d="M27 15l5 8 5-8" fill="#ecfdf5" />
            <circle cx="32" cy="27" r="1.5" fill="#ecfdf5" />
            <circle cx="32" cy="32" r="1.5" fill="#ecfdf5" />
          </>
        )}
        {item.art === "shorts" && (
          <>
            <path d="M20 18h24l2 24H35l-3-11-3 11H18l2-24z" fill="#fbbf24" stroke="#b45309" strokeWidth="1.5" />
            <line x1="20" y1="23" x2="44" y2="23" stroke="#fef3c7" strokeWidth="2" />
          </>
        )}
        {item.art === "vest" && (
          <>
            <path d="M22 15h20l5 7v27H17V22l5-7z" fill="#d97706" stroke="#92400e" strokeWidth="1.5" />
            <rect x="22" y="33" width="8" height="8" rx="1.5" fill="#fef3c7" />
            <rect x="34" y="33" width="8" height="8" rx="1.5" fill="#fef3c7" />
          </>
        )}
        {item.art === "dress" && (
          <path d="M25 14h14l2 9 9 25H14l9-25 2-9z" fill="#ec4899" stroke="#be185d" strokeWidth="1.5" />
        )}
        {item.art === "skirt" && (
          <path d="M22 20h20l6 26H16l6-26z" fill="#f472b6" stroke="#db2777" strokeWidth="1.5" />
        )}
        {item.art === "bag" && (
          <>
            <rect x="18" y="24" width="28" height="24" rx="4" fill="#fb7185" stroke="#e11d48" strokeWidth="1.5" />
            <path d="M25 24v-4a7 7 0 0 1 14 0v4" fill="none" stroke="#e11d48" strokeWidth="2" />
          </>
        )}
        {item.art === "pillow" && (
          <>
            <rect x="14" y="18" width="24" height="18" rx="5" fill="#f9a8d4" stroke="#db2777" strokeWidth="1.5" />
            <rect x="26" y="28" width="24" height="18" rx="5" fill="#fbcfe8" stroke="#db2777" strokeWidth="1.5" />
          </>
        )}
        {item.art === "cup" && (
          <>
            <path d="M22 20h20l-2 28H24l-2-28z" fill="#fde68a" stroke="#d97706" strokeWidth="1.5" />
            <line x1="36" y1="10" x2="32" y2="20" stroke="#78350f" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {item.art === "pot" && (
          <>
            <rect x="16" y="26" width="32" height="22" rx="4" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
            <path d="M12 29h4M48 29h4" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M28 22h8v4h-8z" fill="#64748b" />
          </>
        )}
        {item.art === "vase" && (
          <path d="M26 16h12l-2 7c6 4 7 15 4 25H24c-3-10-2-21 4-25l-2-7z" fill="#fdba74" stroke="#ea580c" strokeWidth="1.5" />
        )}
        {item.art === "jar" && (
          <>
            <rect x="19" y="22" width="26" height="26" rx="5" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
            <rect x="17" y="16" width="30" height="7" rx="2" fill="#94a3b8" />
          </>
        )}
        {item.art === "rug" && (
          <>
            <rect x="14" y="20" width="36" height="24" rx="3" fill="#fca5a5" stroke="#dc2626" strokeWidth="1.5" />
            <rect x="20" y="25" width="24" height="14" rx="2" fill="#fef2f2" stroke="#dc2626" strokeWidth="1" />
          </>
        )}
        {item.art === "curtain" && (
          <>
            <line x1="14" y1="15" x2="50" y2="15" stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
            <path d="M17 16h12v32H17V16zM35 16h12v32H35V16z" fill="#cbd5e1" stroke="#64748b" strokeWidth="1.2" />
          </>
        )}
        {item.art === "fryer" && (
          <>
            <rect x="18" y="15" width="28" height="34" rx="6" fill="#475569" stroke="#1e293b" strokeWidth="1.5" />
            <rect x="22" y="27" width="20" height="16" rx="3" fill="#e2e8f0" />
            <circle cx="26" cy="21" r="2" fill="#fb923c" />
          </>
        )}
        {item.art === "coffee" && (
          <>
            <rect x="18" y="14" width="28" height="34" rx="4" fill="#78350f" stroke="#451a03" strokeWidth="1.5" />
            <rect x="25" y="34" width="14" height="10" rx="2" fill="#fef3c7" />
          </>
        )}
        {item.art === "vacuum" && (
          <>
            <circle cx="32" cy="34" r="16" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="32" cy="34" r="6" fill="#38bdf8" />
          </>
        )}
        {item.art === "blender" && (
          <>
            <path d="M23 14h18l-3 22H26l-3-22z" fill="#bae6fd" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="24" y="36" width="16" height="12" rx="2" fill="#334155" />
          </>
        )}
        {item.art === "iron" && (
          <>
            <path d="M16 42l8-16h18l6 16H16z" fill="#38bdf8" stroke="#0369a1" strokeWidth="1.5" />
            <path d="M26 26v-6h10v6" fill="none" stroke="#0369a1" strokeWidth="2" />
          </>
        )}
        {item.art === "fridge" && (
          <>
            <rect x="20" y="13" width="24" height="38" rx="4" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
            <line x1="20" y1="26" x2="44" y2="26" stroke="#475569" strokeWidth="1.5" />
          </>
        )}
        {item.art === "screen" && (
          <>
            <rect x="14" y="18" width="36" height="26" rx="4" fill="#1e293b" stroke="#0f172a" strokeWidth="1.5" />
            <rect x="18" y="22" width="28" height="18" rx="2" fill="#38bdf8" />
          </>
        )}
        {item.art === "spray" && (
          <>
            <rect x="24" y="24" width="16" height="24" rx="4" fill="#60a5fa" stroke="#2563eb" strokeWidth="1.5" />
            <path d="M28 24v-6h12l4 4" fill="none" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {item.art === "car" && (
          <>
            <path d="M15 38l5-12h24l5 12v10H15V38z" fill="#ef4444" stroke="#991b1b" strokeWidth="1.5" />
            <circle cx="22" cy="46" r="4" fill="#1e293b" />
            <circle cx="42" cy="46" r="4" fill="#1e293b" />
          </>
        )}
        {item.art === "wrench" && (
          <path d="M20 44L39 25a6 6 0 0 1 8-8l-5 5 4 4 5-5a6 6 0 0 1-8 8L24 48a3.5 3.5 0 0 1-4-4z" fill="#f59e0b" stroke="#b45309" strokeWidth="1.5" />
        )}
        {item.art === "plug" && (
          <>
            <rect x="22" y="24" width="20" height="18" rx="4" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
            <line x1="27" y1="15" x2="27" y2="24" stroke="#475569" strokeWidth="2.5" />
            <line x1="37" y1="15" x2="37" y2="24" stroke="#475569" strokeWidth="2.5" />
          </>
        )}
        {item.art === "camera" && (
          <>
            <rect x="15" y="22" width="34" height="22" rx="4" fill="#334155" stroke="#0f172a" strokeWidth="1.5" />
            <circle cx="32" cy="33" r="7" fill="#38bdf8" stroke="#f8fafc" strokeWidth="2" />
          </>
        )}
        {item.art === "seat" && (
          <path d="M22 16h12v18h14v12H22V16z" fill="#64748b" stroke="#334155" strokeWidth="1.5" />
        )}
        {item.art === "blocks" && (
          <>
            <rect x="16" y="30" width="14" height="14" rx="2" fill="#ef4444" />
            <rect x="34" y="30" width="14" height="14" rx="2" fill="#3b82f6" />
            <rect x="25" y="16" width="14" height="14" rx="2" fill="#facc15" />
          </>
        )}
        {item.art === "robot" && (
          <>
            <rect x="20" y="20" width="24" height="26" rx="5" fill="#94a3b8" stroke="#334155" strokeWidth="1.5" />
            <circle cx="27" cy="31" r="2.5" fill="#ef4444" />
            <circle cx="37" cy="31" r="2.5" fill="#ef4444" />
          </>
        )}
        {item.art === "dice" && (
          <>
            <rect x="18" y="18" width="28" height="28" rx="6" fill="#ffffff" stroke="#334155" strokeWidth="2" />
            <circle cx="26" cy="26" r="2.5" fill="#0f172a" />
            <circle cx="38" cy="38" r="2.5" fill="#0f172a" />
            <circle cx="32" cy="32" r="2.5" fill="#0f172a" />
          </>
        )}
        {item.art === "drone" && (
          <>
            <rect x="24" y="27" width="16" height="10" rx="3" fill="#475569" />
            <line x1="16" y1="20" x2="25" y2="28" stroke="#334155" strokeWidth="2" />
            <line x1="48" y1="20" x2="39" y2="28" stroke="#334155" strokeWidth="2" />
          </>
        )}
        {item.art === "bear" && (
          <>
            <circle cx="22" cy="22" r="5" fill="#d97706" />
            <circle cx="42" cy="22" r="5" fill="#d97706" />
            <circle cx="32" cy="34" r="13" fill="#f59e0b" />
          </>
        )}
        {item.art === "puzzle" && (
          <>
            <rect x="18" y="18" width="28" height="28" rx="4" fill="#a78bfa" stroke="#6d28d9" strokeWidth="1.5" />
            <circle cx="32" cy="18" r="4" fill="#a78bfa" />
          </>
        )}
        {item.art === "trophy" && (
          <>
            <path d="M22 16h20v12c0 6-4 10-10 10s-10-4-10-10V16z" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="25" y="44" width="14" height="5" rx="1" fill="#ca8a04" />
          </>
        )}
        {item.art === "bottle" && (
          <>
            <rect x="23" y="24" width="18" height="24" rx="4" fill="#e0f2fe" stroke="#0284c7" strokeWidth="1.5" />
            <rect x="27" y="15" width="10" height="9" rx="2" fill="#38bdf8" />
          </>
        )}
        {item.art === "brush" && (
          <>
            <rect x="29" y="30" width="6" height="18" rx="2" fill="#d97706" />
            <path d="M25 15h14l-2 15H27l-2-15z" fill="#f472b6" />
          </>
        )}
        {item.art === "dryer" && (
          <>
            <rect x="18" y="22" width="26" height="14" rx="5" fill="#f43f5e" />
            <rect x="24" y="36" width="8" height="12" rx="2" fill="#334155" />
          </>
        )}
        {item.art === "heart" && (
          <path d="M32 48S16 37 16 26a8 8 0 0 1 16-2 8 8 0 0 1 16 2c0 11-16 22-16 22z" fill="#fb7185" />
        )}
        {item.art === "drop" && (
          <path d="M32 14C32 14 18 30 18 39a14 14 0 0 0 28 0C46 30 32 14 32 14z" fill="#38bdf8" />
        )}
        {item.art === "perfume" && (
          <>
            <rect x="20" y="26" width="24" height="22" rx="5" fill="#fde047" stroke="#ca8a04" strokeWidth="1.5" />
            <rect x="28" y="16" width="8" height="10" rx="1.5" fill="#ca8a04" />
          </>
        )}
        {item.art === "sparkle" && (
          <path d="M32 14l5 13 13 5-13 5-5 13-5-13-13-5 13-5 5-13z" fill="#c084fc" />
        )}
        {item.art === "necklace" && (
          <>
            <path d="M20 20c0 10 5.5 16 12 16s12-6 12-16" fill="none" stroke="#eab308" strokeWidth="2.5" />
            <polygon points="32,35 37,43 32,50 27,43" fill="#facc15" stroke="#ca8a04" strokeWidth="1.2" />
          </>
        )}
        {item.art === "ring" && (
          <>
            <circle cx="32" cy="36" r="11" fill="none" stroke="#eab308" strokeWidth="3.5" />
            <polygon points="32,16 37,22 32,27 27,22" fill="#38bdf8" />
          </>
        )}
        {item.art === "watch" && (
          <>
            <rect x="26" y="13" width="12" height="38" rx="3" fill="#475569" />
            <circle cx="32" cy="32" r="10" fill="#ffffff" stroke="#eab308" strokeWidth="3" />
          </>
        )}
        {item.art === "glasses" && (
          <>
            <circle cx="22" cy="34" r="8" fill="#1e293b" />
            <circle cx="42" cy="34" r="8" fill="#1e293b" />
            <path d="M30 33h4M14 33l4-6M50 33l-4-6" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          </>
        )}
        {item.art === "gem" && (
          <polygon points="32,15 45,28 32,49 19,28" fill="#38bdf8" stroke="#0284c7" strokeWidth="1.5" />
        )}
        {item.art === "wallet" && (
          <>
            <rect x="16" y="20" width="32" height="24" rx="4" fill="#92400e" stroke="#451a03" strokeWidth="1.5" />
            <rect x="35" y="28" width="13" height="8" rx="2" fill="#fbbf24" />
          </>
        )}
        {item.art === "crown" && (
          <polygon points="16,42 18,22 27,31 32,18 37,31 46,22 48,42" fill="#facc15" stroke="#ca8a04" strokeWidth="1.5" />
        )}
        {!item.art && (
          <text x="32" y="38" textAnchor="middle" fontSize="22">
            {fallbackIcon || "✨"}
          </text>
        )}
      </svg>
    </div>
  );
}

const BRAND_STYLES = [
  "bg-rose-600 text-white border-rose-600",
  "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-amber-200 dark:border-amber-800/60",
  "bg-yellow-400 text-zinc-950 border-yellow-400",
  "bg-red-600 text-white border-red-600",
  "bg-sky-50 dark:bg-sky-950/50 text-sky-900 dark:text-sky-200 border-sky-200 dark:border-sky-800/60",
  "bg-zinc-900 dark:bg-zinc-800 text-white border-zinc-800 dark:border-zinc-700",
  "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-900 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800/60",
];

function BrandTile({ brand, index }) {
  const styleClass = BRAND_STYLES[index % BRAND_STYLES.length];
  return (
    <div
      className={`mb-1.5 flex h-12 sm:h-14 w-full items-center justify-center rounded-xl border px-2 text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition group-hover:scale-[1.03] ${styleClass}`}
    >
      <span className="text-xs font-black tracking-tight truncate">
        {brand}
      </span>
    </div>
  );
}

export default function CategoryMegaMenu({ categories = DEFAULT_CATEGORIES }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuPos, setMenuPos] = useState({ top: 72, left: 24, width: 1280 });
  const buttonRef = useRef(null);
  const panelRef = useRef(null);
  const closeTimerRef = useRef(null);

  const clearCloseTimer = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const updatePosition = () => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportW = window.innerWidth;
    const isMobile = viewportW < 768;
    const margin = isMobile ? 12 : 24;

    const maxWidth = isMobile
      ? viewportW - margin * 2
      : Math.min(1360, viewportW - margin * 2);
    const width = Math.max(260, maxWidth);
    const left = Math.max(margin, Math.round((viewportW - width) / 2));

    setMenuPos({
      top: rect.bottom + 8,
      left,
      width,
    });
  };

  const handleOpen = () => {
    clearCloseTimer();
    updatePosition();
    setOpen(true);
  };

  const handleScheduleClose = () => {
    clearCloseTimer();
    closeTimerRef.current = setTimeout(() => {
      setOpen(false);
    }, 160);
  };

  useEffect(() => {
    if (!open) return;
    updatePosition();

    const onScrollOrResize = () => updatePosition();
    const onKeyDown = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onClickOutside = (e) => {
      const clickedButton =
        buttonRef.current && buttonRef.current.contains(e.target);
      const clickedPanel = panelRef.current && panelRef.current.contains(e.target);
      if (!clickedButton && !clickedPanel) {
        setOpen(false);
      }
    };

    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onClickOutside);

    return () => {
      clearCloseTimer();
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onClickOutside);
    };
  }, [open]);

  const list =
    Array.isArray(categories) && categories.length > 0
      ? categories
      : DEFAULT_CATEGORIES;
  const activeCategory = list[activeIndex] || list[0];

  const popup =
    open && typeof document !== "undefined"
      ? createPortal(
          <div
            ref={panelRef}
            role="menu"
            onMouseEnter={clearCloseTimer}
            onMouseLeave={handleScheduleClose}
            style={{
              top: `${menuPos.top}px`,
              left: `${menuPos.left}px`,
              width: `${menuPos.width}px`,
            }}
            className="fixed z-[9999] grid grid-cols-1 md:grid-cols-[240px_1fr] max-h-[calc(100vh-96px)] overflow-hidden rounded-2xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-[0_24px_70px_rgba(0,0,0,0.35)]"
          >
            <div className="flex md:flex-col overflow-x-auto md:overflow-y-auto md:max-h-[calc(100vh-96px)] border-b md:border-b-0 md:border-r border-gray-200 dark:border-zinc-800 bg-gray-50/90 dark:bg-zinc-900/70 py-1.5 md:py-2 px-2 md:px-0 shrink-0">
              {list.map((cat, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={cat.slug || cat.name}
                    type="button"
                    onMouseEnter={() => setActiveIndex(idx)}
                    onClick={() => setActiveIndex(idx)}
                    onFocus={() => setActiveIndex(idx)}
                    className={`flex items-center gap-2.5 md:gap-3 px-3 md:px-4 py-2 md:py-2.5 text-left text-xs whitespace-nowrap md:whitespace-normal rounded-lg md:rounded-none transition cursor-pointer ${
                      isSelected
                        ? "bg-white dark:bg-zinc-950 font-bold text-orange-600 dark:text-orange-400 shadow-[inset_0_-2px_0_#ea580c] md:shadow-[inset_3px_0_0_#ea580c]"
                        : "font-medium text-zinc-700 dark:text-zinc-300 hover:bg-white/70 dark:hover:bg-zinc-900 hover:text-zinc-950 dark:hover:text-white"
                    }`}
                  >
                    <span className="text-base shrink-0">{cat.icon || "📦"}</span>
                    <span className="md:truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>

            {activeCategory && (
              <div className="overflow-y-auto bg-white dark:bg-zinc-950 p-4 sm:p-6 space-y-6">
                <div>
                  <div className="mb-3.5 flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      Recommended
                    </h3>
                    <Link
                      to={`/category/${activeCategory.slug}`}
                      onClick={() => setOpen(false)}
                      className="text-xs font-semibold text-orange-600 dark:text-orange-400 hover:underline shrink-0"
                    >
                      All in {activeCategory.name} →
                    </Link>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {(activeCategory.recommended || []).map((item) => (
                      <Link
                        key={item.label}
                        to={item.to}
                        onClick={() => setOpen(false)}
                        className="group flex flex-col items-center rounded-xl p-2 text-center transition hover:bg-gray-50 dark:hover:bg-zinc-900"
                      >
                        <ItemVisual item={item} fallbackIcon={activeCategory.icon} />
                        <span className="text-xs leading-snug text-zinc-700 dark:text-zinc-300 group-hover:text-orange-600 dark:group-hover:text-orange-400 line-clamp-2">
                          {item.label}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="mb-3.5 text-sm font-bold text-zinc-900 dark:text-zinc-100">
                    Shop By Brand
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {(activeCategory.brands || []).map((brand, idx) => (
                      <Link
                        key={brand}
                        to={`/category/${activeCategory.slug}?brand=${encodeURIComponent(
                          brand
                        )}`}
                        onClick={() => setOpen(false)}
                        className="group flex flex-col items-center rounded-xl p-2 text-center transition hover:bg-gray-50 dark:hover:bg-zinc-900"
                      >
                        <BrandTile brand={brand} index={idx} />
                        <span className="text-[11px] text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100 truncate w-full">
                          {brand}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>,
          document.body
        )
      : null;

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleOpen}
      onMouseLeave={handleScheduleClose}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => {
          updatePosition();
          setOpen((prev) => !prev);
        }}
        onFocus={handleOpen}
        className={`flex items-center gap-2 rounded-full border px-3.5 sm:px-4 py-2 text-xs font-bold transition cursor-pointer ${
          open
            ? "border-orange-500 bg-orange-50 dark:bg-zinc-800 text-orange-600 dark:text-orange-400"
            : "border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 hover:border-orange-500/60"
        }`}
      >
        <span>☰</span>
        <span>All Categories</span>
      </button>
      {popup}
    </div>
  );
}