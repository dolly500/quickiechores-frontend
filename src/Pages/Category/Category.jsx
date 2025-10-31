import "./Category.css";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import baseUrl from "../../../server.js";

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/api/category/list`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Filter only active categories
        const activeCategories = data.data.filter(category => category.isActive);
        setCategories(activeCategories);
      } else {
        throw new Error('API returned unsuccessful response');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryClick = (categoryName) => {
    // Navigate to the category services page
    navigate(`/category/${categoryName}`);
  };

  const getImageUrl = (imageName) => {
    if (!imageName) return '/api/placeholder/300/200';
    return `${baseUrl}/images/${imageName}`;
  };

  if (loading) {
    return (
      <div className="explore-services" id="explore-services">
        <div className="explore-services-header">
          <h1>Checkout our Service <span className="highlight">Categories</span></h1>
          <p className="explore-services-subtitle">
            Service categories help organize and structure the offerings on a marketplace,
            <br />making it easier for users to find what you need.
          </p>
        </div>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading service categories...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="explore-services" id="explore-services">
        <div className="explore-services-header">
          <h1>Checkout our Service <span className="highlight">Categories</span></h1>
          <p className="explore-services-subtitle">
            Service categories help organize and structure the offerings on a marketplace,
            <br />making it easier for users to find what you need.
          </p>
        </div>
        <div className="error-container">
          <p>Error loading service categories: {error}</p>
          <button onClick={fetchCategories} className="retry-btn">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="explore-services" id="explore-services">
      <div className="explore-services-header">
        <h1>Checkout our Service <span className="highlight">Categories</span></h1>
        <p className="explore-services-subtitle">
          Service categories help organize and structure the offerings on a marketplace,
          making it easier for users to find what you need.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="no-categories">
          <p>No categories available</p>
        </div>
      ) : (
        <div className="categories-grid">
          {categories.map((category) => {
            const imageUrl = category.image 
              ? getImageUrl(category.image)
              : '/api/placeholder/300/200';
            
            return (
              <div
                key={category._id}
                className="category-card"
                onClick={() => handleCategoryClick(category.name)}
                style={{ cursor: 'pointer' }}
              >
                <div className="category-icon-wrapper">
                  <div className="category-icon">
                    <img
                      src={imageUrl}
                      alt={category.name}
                      onError={(e) => {
                        e.target.src = '/api/placeholder/300/200';
                      }}
                    />
                  </div>
                </div>
                
                <div className="category-info">
                  <h3 className="category-name">{category.name}</h3>
                  {/* <p className="category-description">
                    {category.description}
                  </p>
                  <div className="category-meta">
                    <strong>{category.serviceCount || 0} services</strong>
                  </div> */}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Category;