import React, { useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";

const AnimeCard = ({ anime }) => {
  const [expanded, setExpanded] = useState(false);

  if (!anime) return null;

  const {
    title,
    images,
    type,
    episodes,
    rating,
    duration,
    score,
    broadcast,
    synopsis,
    studios,
    genres,
    year,
    season,
    trailer,
    url,
  } = anime;

  // handle multiple images (extendable if API returns more)
  const imageList = [
    images?.jpg?.large_image_url,
    images?.webp?.large_image_url,
  ].filter(Boolean);

  const Badge = ({ children, style = {} }) => (
    <span
      style={{
        backgroundColor: "#444",
        color: "#eee",
        padding: "0.3rem 0.6rem",
        borderRadius: "999px",
        fontSize: "0.75rem",
        marginRight: "0.4rem",
        ...style,
      }}
    >
      {children}
    </span>
  );

  return (
    <>
      {/* Basic Card */}
      <div
        style={{
          ...styles.card,
          backgroundImage: `url(${images?.jpg?.large_image_url})`,
        }}
      >
        <div style={styles.overlay}>
          <div style={styles.top}>
            <h3 style={styles.title}>{title}</h3>
            <p style={styles.meta}>
              {type} • {duration} • {episodes ?? "TBA"} eps
            </p>
          </div>
          <div
            style={styles.expandIcon}
            onClick={() => setExpanded(true)}
            title="Expand"
          >
            ➤
          </div>
        </div>
      </div>

      {/* Detail Overlay */}
      {expanded && (
        <div style={styles.overlayWrapper}>
          <div style={styles.detailPanel}>
            {/* Close button */}
            <button style={styles.closeButton} onClick={() => setExpanded(false)}>
              ×
            </button>

            {/* Carousel Top */}
            <div style={{ marginBottom: "1rem" }}>
              <Carousel
                showThumbs={false}
                showStatus={false}
                infiniteLoop
                autoPlay={false}
                swipeable
              >
                {imageList.map((img, i) => (
                  <div key={i}>
                    <img
                      src={img}
                      alt={`${title} ${i}`}
                      style={{ borderRadius: "8px", maxHeight: "300px", objectFit: "cover" }}
                    />
                  </div>
                ))}
              </Carousel>
            </div>

            {/* Details */}
            <div style={styles.detailBody}>
              <h2>{title}</h2>
              <p style={styles.metaText}>
                {type} | {episodes || "TBA"} episodes | {duration}
              </p>

              {/* Badges */}
              <div style={styles.badgeGroup}>
                {genres?.map((g) => (
                  <Badge key={g.mal_id}>{g.name}</Badge>
                ))}
                {studios?.map((s) => (
                  <Badge key={s.mal_id} style={{ backgroundColor: "#8a2be2" }}>
                    {s.name}
                  </Badge>
                ))}
              </div>

              {/* Synopsis */}
              <p style={styles.synopsis}>
                {synopsis || "No synopsis available."}
              </p>

              {/* Info */}
              <p style={styles.metaText}>
                Season: {season} {year}
              </p>
              <p style={styles.metaText}>
                Broadcast: {broadcast?.string || "Unknown"}
              </p>
              <p style={styles.metaText}>Rating: {rating || "N/A"}</p>
              <p style={styles.metaText}>Score: {score || "N/A"}</p>

              {/* Links */}
              <div style={styles.linkGroup}>
                {url && (
                  <a
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    View on MAL →
                  </a>
                )}
                {trailer?.url && (
                  <a
                    href={trailer.url}
                    target="_blank"
                    rel="noreferrer"
                    style={styles.link}
                  >
                    ▶ Watch Trailer
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// 💅 Styles
const styles = {
  card: {
    position: "relative",
    height: "220px",
    width: "100%",
    borderRadius: "12px",
    backgroundSize: "cover",
    backgroundPosition: "center",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "flex-end",
    cursor: "pointer",
    color: "#fff",
  },
  overlay: {
    background: "linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.1))",
    width: "100%",
    padding: "1rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  top: {
    display: "flex",
    flexDirection: "column",
  },
  title: {
    fontSize: "1.1rem",
    fontWeight: "600",
    margin: 0,
  },
  meta: {
    fontSize: "0.8rem",
    color: "#ccc",
  },
  expandIcon: {
    fontSize: "1.2rem",
    backgroundColor: "#3f51b5",
    color: "#fff",
    borderRadius: "50%",
    padding: "0.3rem 0.5rem",
    cursor: "pointer",
    alignSelf: "flex-start",
  },

  // Overlay Panel
  overlayWrapper: {
    position: "fixed",
    top: 0,
    right: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0,0,0,0.7)",
    backdropFilter: "blur(2px)",
    zIndex: 9999,
  },
  detailPanel: {
    position: "absolute",
    top: 0,
    right: 0,
    height: "100%",
    width: "100%",
    maxWidth: "700px",
    background: "#1e1e1e",
    color: "#fff",
    overflowY: "auto",
    padding: "2rem 1.5rem",
    animation: "slideIn 0.3s ease-out forwards",
  },
  detailHeader: {
    marginBottom: "1.5rem",
    position: "relative",
  },
  closeButton: {
    position: "absolute",
    right: 0,
    top: 0,
    fontSize: "2rem",
    background: "transparent",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  detailBody: {
    fontSize: "0.95rem",
    lineHeight: 1.5,
  },
  badgeGroup: {
    marginBottom: "1rem",
    display: "flex",
    flexWrap: "wrap",
    gap: "0.5rem",
  },
  synopsis: {
    marginBottom: "1rem",
    color: "#ccc",
  },
  metaText: {
    fontSize: "0.85rem",
    color: "#aaa",
    marginBottom: "0.4rem",
  },
  linkGroup: {
    marginTop: "1rem",
  },
  link: {
    color: "#7cc0ff",
    textDecoration: "none",
    display: "inline-block",
    marginRight: "1rem",
    fontWeight: "500",
  },
};

// 💡 Keyframe styles to inject (optional for animation)
const styleSheet = document.styleSheets[0];
const keyframes = `
@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}`;
styleSheet.insertRule(keyframes, styleSheet.cssRules.length);

export default AnimeCard;
