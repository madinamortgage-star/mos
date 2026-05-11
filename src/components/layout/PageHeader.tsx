import React from "react";

interface PageHeaderProps {
  title: string;
  crumb?: string;
  right?: React.ReactNode;
}

export function PageHeader({ title, crumb, right }: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        {crumb && <div className="crumb">{crumb}</div>}
        <h1>{title}</h1>
      </div>
      {right && <div className="right">{right}</div>}
    </div>
  );
}
