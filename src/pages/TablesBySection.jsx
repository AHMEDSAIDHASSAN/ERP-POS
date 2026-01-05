import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { imageBase, relatedTables } from "../services/apis";
import { useSelector } from "react-redux";

export default function TablesBySection() {
  const { id } = useParams();
  const token = useSelector((store) => store.user.token);

  const {
    data: tables,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["related-tables", id],
    queryFn: () => relatedTables(id, token),
  });

  if (isLoading) {
    return (
      <div className="text-center text-gray-400 text-lg mt-12">
        Loading tables...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-400 text-lg mt-12">
        Error loading tables: {error.message}
      </div>
    );
  }

  console.log(tables.data);
  return (
    <div>
      <h3 className="text-2xl tracking-wider font-semibold">Related Tables</h3>

      {tables?.data?.length === 0 ? (
        <div className="text-center text-gray-400 text-lg mt-12">
          No tables found. Create your first table to get started.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tables?.data[0]?.tables?.map((table) => (
            <div
              key={table._id}
              className="bg-secondary rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
            >
              <div className="relative">
                <img
                  src={table.image ? `${imageBase}/${table.image}` : null}
                  alt={table.name}
                  className="w-full h-48 object-cover"
                />
              </div>

              <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {table.name.replace(/_/g, " ").toUpperCase()}
                </h3>

                <div className="text-sm text-gray-400 mb-2">
                  Section: {table?.section?.name}
                </div>
                {/* <div className="text-sm text-gray-400 mb-2">
                  Table ID: {table._id.slice(-6)}
                </div> */}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
