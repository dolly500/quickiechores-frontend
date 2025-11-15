import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import baseUrl from "../../../server.js";

const ExploreMenu = ({ category, setCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  
  // Show more items per page for pill layout
  const getItemsPerPage = () => {
    if (window.innerWidth <= 767) return 8;
    if (window.innerWidth <= 1024) return 12;
    return 15;
  };

  const [itemsPerPage, setItemsPerPage] = useState(getItemsPerPage());

  useEffect(() => {
    const handleResize = () => {
      const newItemsPerPage = getItemsPerPage();
      setItemsPerPage(newItemsPerPage);
      const maxPage = Math.ceil(categories.length / newItemsPerPage);
      if (currentPage > maxPage) {
        setCurrentPage(1);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [categories.length, currentPage]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/category/list`);
        const result = await response.json();

        if (result.success) {
          setCategories(result.data);
        } else {
          setError("Failed to fetch categories");
        }
      } catch (err) {
        setError("Error fetching categories: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleCategoryClick = (categoryName) => {
    setCategory(categoryName);
    navigate(`/category/${categoryName}`);
  };

  const totalPages = Math.ceil(categories.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCategories = categories.slice(startIndex, endIndex);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}></div>
          <p>Loading Chores categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={styles.errorContainer}>
          <p>Error loading service categories: {error}</p>
          <button
            onClick={() => window.location.reload()}
            style={styles.retryBtn}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.title}>Check Chores Categories</div>
      <div style={styles.categoriesWrapper}>
        <div style={styles.pillContainer}>
          {currentCategories.map((item) => (
            <button
              onClick={() => handleCategoryClick(item.name)}
              key={item._id}
              style={{
                ...styles.pill,
                ...(category === item.name ? styles.activePill : {})
              }}
              onMouseEnter={(e) => {
                if (category !== item.name) {
                  e.currentTarget.style.borderColor = 'rgb(78, 205, 196)';
                  e.currentTarget.style.color = 'rgb(78, 205, 196)';
                }
              }}
              onMouseLeave={(e) => {
                if (category !== item.name) {
                  e.currentTarget.style.borderColor = '#d1d5db';
                  e.currentTarget.style.color = '#374151';
                }
              }}
            >
              {item.name}
            </button>
          ))}
        </div>

        {totalPages > 1 && (
          <div style={styles.pagination}>

            <div style={styles.paginationNumbers}>
              {[...Array(totalPages)].map((_, index) => {
                const pageNumber = index + 1;
                if (
                  pageNumber === 1 ||
                  pageNumber === totalPages ||
                  (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                ) {
                  return (
                    <button
                      key={pageNumber}
                      style={{
                        ...styles.pageNumber,
                        ...(currentPage === pageNumber ? styles.activePageNumber : {})
                      }}
                      onClick={() => goToPage(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                } else if (
                  pageNumber === currentPage - 2 ||
                  pageNumber === currentPage + 2
                ) {
                  return <span key={pageNumber} style={styles.ellipsis}>...</span>;
                }
                return null;
              })}
            </div>

           
          </div>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '30px 3%',
    maxWidth: '1400px',
    margin: '0 auto',
    marginTop: '-3rem',
  },
  title: {
    fontSize: '20px',
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: '40px',
    textAlign: 'center',
  },
  categoriesWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  pillContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '10px',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pill: {
    padding: '10px 25px',
    borderRadius: '50px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    fontSize: '16px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
    outline: 'none',
  },
  activePill: {
    borderColor: 'gray',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '16px',
    marginTop: '20px',
  },
  paginationBtn: {
    padding: '10px 20px',
    borderRadius: '8px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  disabledBtn: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  paginationNumbers: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
  },
  pageNumber: {
    padding: '8px 14px',
    borderRadius: '6px',
    border: '1px solid #d1d5db',
    backgroundColor: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  activePageNumber: {
    backgroundColor: 'rgb(78, 205, 196)',
    color: '#ffffff',
    borderColor: 'rgb(78, 205, 196)',
  },
  ellipsis: {
    color: '#9ca3af',
    fontSize: '14px',
    padding: '0 4px',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '20px',
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid rgb(78, 205, 196)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    gap: '20px',
  },
  retryBtn: {
    padding: '12px 24px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgb(78, 205, 196)',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
  },
};

ExploreMenu.propTypes = {
  category: PropTypes.string.isRequired,
  setCategory: PropTypes.func.isRequired,
};

export default ExploreMenu;