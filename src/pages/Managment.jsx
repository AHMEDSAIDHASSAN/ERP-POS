import { TableOfContents } from "lucide-react";
import Category from "../components/category/Category";
import { useState } from "react";
import SubCategory from "../components/subCategory/SubCategory";
import Dishes from "../components/dishes/Dishes";
import Ingredient from "../components/ingredients/Ingredient";

export default function Managment() {
  const [state, setState] = useState(1);
  return (
    <div>
      <div className="flex justify-between items-center flex-wrap">
        <h3 className=" font-semibold  tracking-wider text-lg">
          Service Managment
        </h3>
        <div className="flex items-center border-[1px] rounded-md overflow-x-auto hide-scrollbar border-popular w-full sm:w-fit max-w-full">
          <button
            onClick={() => setState(1)}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              state == 1 ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Category</span>
          </button>

          <button
            onClick={() => setState(2)}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              state == 2 ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Sub Category</span>
          </button>

          <button
            onClick={() => setState(3)}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              state == 3 ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Product</span>
          </button>
          <button
            onClick={() => setState(4)}
            className={`flex items-center gap-x-3 px-4 py-2 text-xs whitespace-nowrap min-w-fit ${
              state == 4 ? "bg-popular text-white" : ""
            }`}
          >
            <span>
              <TableOfContents size={15} />
            </span>
            <span>Ingredient</span>
          </button>
        </div>
      </div>
      <div className="content">
        {state == 1 && <Category />}
        {state == 2 && <SubCategory />}
        {state == 3 && <Dishes />}
        {state == 4 && <Ingredient />}
      </div>
    </div>
  );
}
