import React from "react";
import "../css/style.css"; // biar nyatuin style

export default function Pagination({ currentPage, totalItems, itemsPerPage, onPageChange }) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  if (totalPages <= 1) return null; // gak usah tampil kalau cuma 1 halaman

  return (
    <div className="pagination-container">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        &laquo; Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => (
        <button
          key={i + 1}
          className={`pagination-btn ${currentPage === i + 1 ? "active" : ""}`}
          onClick={() => onPageChange(i + 1)}
        >
          {i + 1}
        </button>
      ))}

      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Next &raquo;
      </button>
    </div>
  );
}