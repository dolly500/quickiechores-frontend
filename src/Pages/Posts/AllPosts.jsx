import { useState, useEffect } from 'react';
import { Clock, Eye, Heart, Calendar, User, Tag } from 'lucide-react';
import baseUrl from '../../../server.js';

const BlogPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseUrl}/api/posts/list`);
        const result = await response.json();
        if (result.success) setPosts(result.data);
        else throw new Error('Failed to fetch posts');
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

  if (loading)
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '100px 20px', fontSize: '18px' }}>
        <span>Loading amazing content...</span>
      </div>
    );

  if (error)
    return (
      <div style={{ textAlign: 'center', padding: '60px 20px', color: 'red' }}>
        <h3>Oops! Something went wrong 😞</h3>
        <p>{error}</p>
      </div>
    );

  return (
    <div
      style={{
        minHeight: '100vh',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(30px); }
            to { opacity: 1; transform: translateY(0); }
          }

          .blog-card {
            transition: all 0.4s ease;
            animation: fadeInUp 0.6s ease-out;
          }
          .blog-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
          }

          /* === RESPONSIVE STYLES === */
          @media (max-width: 1024px) {
            .posts-grid {
              grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
              gap: 25px;
            }
          }
          @media (max-width: 768px) {
            .posts-grid {
              grid-template-columns: 1fr;
              gap: 20px;
            }
            header h1 {
              font-size: 1.8rem !important;
            }
            .tag {
              font-size: 11px !important;
              padding: 5px 10px !important;
            }
            .stat-grid {
              grid-template-columns: 1fr !important;
              gap: 10px !important;
            }
          }
          @media (max-width: 480px) {
            header h1 {
              font-size: 1.5rem !important;
            }
            .blog-card img {
              height: 200px !important;
            }
            .tag {
              font-size: 10px !important;
              padding: 4px 8px !important;
            }
          }
        `}
      </style>

      <div style={{ maxWidth: '1300px', margin: '0 auto', padding: '40px 20px', marginTop: '-3rem' }}>
        <header style={{ marginBottom: '40px', textAlign: 'center' }}>
          <h1
            style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              fontWeight: '500',
              color: '#111',
              margin: '0 0 20px'
            }}
          >
            Latest Blog Posts
          </h1>
        </header>

        {posts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <h3 style={{ color: '#374151' }}>No Posts Yet</h3>
            <p style={{ color: '#9ca3af' }}>Check back soon for more content.</p>
          </div>
        ) : (
          <div
            className="posts-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
              gap: '30px'
            }}
          >
            {posts.map((post, index) => (
              <article
                key={post._id}
                className="blog-card"
                style={{
                  backgroundColor: 'white',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                  animationDelay: `${index * 0.1}s`
                }}
              >
                <img
                  src={post.image?.startsWith('http') ? post.image : `${baseUrl}/images/${post.image}`}
                  alt={post.title}
                  className="blog-card-image"
                  style={{
                    width: '100%',
                    height: '240px',
                    objectFit: 'cover'
                  }}
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/400x240?text=No+Image')}
                />
                <div style={{ padding: '24px' }}>
                  <h2
                    style={{
                      fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                      fontWeight: '500',
                      color: '#1f2937',
                      margin: '0 0 12px'
                    }}
                  >
                    {post.title}
                  </h2>
                  <p
                    style={{
                      color: '#6b7280',
                      fontSize: '15px',
                      lineHeight: '1.6',
                      marginBottom: '16px'
                    }}
                  >
                    {post.excerpt}
                  </p>

                  {post.tags && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                      {post.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="tag"
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            backgroundColor: '#f3f4f6',
                            color: '#374151',
                            padding: '6px 12px',
                            borderRadius: '16px',
                            fontSize: '12px',
                            fontWeight: '400'
                          }}
                        >
                          <Tag size={12} />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div
                    className="stat-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '20px',
                      borderTop: '1px solid #f1f5f9',
                      paddingTop: '16px'
                    }}
                  >
                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <User size={14} /> <span>{post.author}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} /> <span>{formatDate(post.publishedAt)}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: '13px', color: '#64748b' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        <Clock size={14} /> <span>{post.readTime} min read</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Eye size={14} /> {post.views}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Heart size={14} /> {post.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPosts;
