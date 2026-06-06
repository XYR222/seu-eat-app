import type { FoodFeedback } from "@/types";
import { foodItems } from "@/data/foods";

const comments = [
  "出餐速度挺快，饭点排队还能接受。",
  "价格比较稳定，适合预算不高的时候。",
  "口味比较家常，不太容易踩雷。",
  "有时候会偏咸，淡口慎选。",
  "分量比看起来足，下午不容易饿。",
  "适合赶课前快速解决一餐。",
];

export const feedbackItems: FoodFeedback[] = Array.from({ length: foodItems.length }, (_, index) => {
  const id = `food_${String(index + 1).padStart(3, "0")}`;
  const likes = 8 + ((index * 7) % 19);
  const dislikes = (index * 3) % 6;
  const salty = index % 5 === 0 ? 5 : index % 7 === 0 ? 3 : 0;
  const spicy = index % 6 === 0 ? 4 : 0;
  return {
    foodId: id,
    likes,
    dislikes,
    tagVotes: {
      出餐快: 4 + ((index * 2) % 10),
      性价比高: 3 + ((index * 5) % 9),
      量大: 2 + ((index * 4) % 7),
      偏咸: salty,
      偏辣: spicy,
      清淡: index % 3 === 0 ? 7 : 2,
      油腻: index % 8 === 0 ? 4 : 1,
      适合减脂: index % 4 === 0 ? 5 : 1,
      容易卖完: index % 9 === 0 ? 4 : 1,
    },
    comments: [
      comments[index % comments.length],
      comments[(index + 2) % comments.length],
      comments[(index + 4) % comments.length],
    ],
  };
});
