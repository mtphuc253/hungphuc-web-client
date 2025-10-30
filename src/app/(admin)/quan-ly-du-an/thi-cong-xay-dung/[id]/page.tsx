import React from "react";

const Page = ({ params }: { params: { id: string } }) => {
  return <div>Chi tiết dự án thi công: {params.id}</div>;
};

export default Page;
