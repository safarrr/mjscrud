"use client";
import { AuthContexts, AuthContextType } from "@/components/authProvider";
import { useContext, useState } from "react";
import TableUser from "./TableUser";
import { PaginationState } from "@tanstack/react-table";
import useFetch from "@/lib/hooks/useFetch";
import SheetUserEdit from "@/components/sheetUserEdit";
import SheetCreateUser from "@/components/sheetUserCreate";
import { UserType } from "@/lib/typs/user";
import axios from "axios";
import { logout } from "@/lib/action";

function Dash() {
  const [editSheet, setEditSheet] = useState(false);
  const [selectEdit, setSelectEdit] = useState<UserType | null>(null);
  const user = useContext<AuthContextType>(AuthContexts);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const api = useFetch<{
    count: number;
    data: UserType[];
  }>(`/api/user?page=${pagination.pageIndex}&pageSize=${pagination.pageSize}`);
  if (api.error) return <p>Error: {api.error.message}</p>;

  const handleEdit = (row: UserType) => {
    setSelectEdit(row);
    setEditSheet(true);
  };
  const hendleDelete = async (row: UserType) => {
    try {
      await axios.delete("/api/user/" + row.id, {
        headers: {
          Authorization: `Bearer ${user?.token}`,
        },
      });
      api.refetch();
    } catch (error) {
      if (axios.isAxiosError(error)) {
      } else {
      }
    }
  };
  return (
    <div className="w-full p-2 flex flex-col space-y-3">
      <div className="inline-flex bg-card border justify-between border-border rounded p-2  space-y-2">
        <h1 className=" text-2xl">Hai {user?.user.username}</h1>
        <button onClick={() => logout()}>logout</button>
      </div>
      <SheetCreateUser getData={() => api.refetch()} />
      <div className="w-full">
        <TableUser
          data={api.data ? api.data?.data : []}
          setPagination={setPagination}
          pagination={pagination}
          isLoading={api.loading}
          totalCount={api.data?.count ? api.data?.count : 0}
          hendleEdit={handleEdit}
          hendleDelete={hendleDelete}
        />
      </div>
      {selectEdit && (
        <SheetUserEdit
          getData={() => {
            setEditSheet(false);
            setSelectEdit(null);
            api.refetch();
          }}
          initialData={selectEdit}
          openSheet={editSheet}
          setOpenSheet={(e) => {
            setEditSheet(e);
            if (!e) {
              setSelectEdit(null);
            }
          }}
        />
      )}
    </div>
  );
}

export default Dash;
