/**
 * @module TournamentSetup
 * @description Simple wizard for selecting cat names and starting a tournament.
 * Shows names and descriptions by default. Admin users get advanced filtering options.
 */
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  supabase,
  getNamesWithDescriptions,
} from "../../supabase/supabaseClient";
import devLog from "../../utils/logger";
import { LoadingSpinner, NameCard, ErrorBoundary } from "../";
import useSupabaseStorage from "../../supabase/useSupabaseStorage";
import styles from "./TournamentSetup.module.css";

const CAT_IMAGES = [
  "IMG_4844.jpg",
  "IMG_4845.jpg",
  "IMG_4846.jpg",
  "IMG_4847.jpg",
  "IMG_5044.JPEG",
  "IMG_5071.JPG",
];

const DEFAULT_DESCRIPTION = "A name as unique as your future companion";

// Simple welcome section - basic instructions only
const WelcomeSection = ({ isExpanded, setIsExpanded, categories, isAdmin }) => (
  <div className={styles.welcomeSection}>
    <h2>yo, help me pick a name ✌️</h2>
    <div
      className={`${styles.welcomeText} ${isExpanded ? styles.expanded : ""}`}
    >
      <button
        className={styles.expandToggle}
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        aria-controls="welcome-instructions"
      >
        <span className={styles.toggleText}>
          {isExpanded ? "Hide Instructions" : "Show Instructions"}
        </span>
        <span className={styles.toggleIcon}>{isExpanded ? "−" : "+"}</span>
      </button>
      <div id="welcome-instructions" className={styles.instructionsContent}>
        <p>here&apos;s how it works:</p>
        <ol className={styles.tournamentSteps}>
          <li>pick some names you vibe with</li>
          <li>vote on your faves in 1v1 battles</li>
          <li>watch the best name win</li>
          <li>that&apos;s it!</li>
        </ol>

        {/* Admin-only category tip */}
        {isAdmin && categories && categories.length > 0 && (
          <div className={styles.categoriesInfo}>
            <p>
              💡 <strong>Pro tip:</strong> Use the category filters below to
              find names that match your style!
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// Simple name selection - names and descriptions only
const NameSelection = ({
  selectedNames,
  availableNames,
  onToggleName,
  isAdmin,
  // Admin-only props
  categories,
  selectedCategory,
  onCategoryChange,
  searchTerm,
  onSearchChange,
  sortBy,
  onSortChange,
}) => {
  // For non-admin users, just show all names
  const displayNames = isAdmin
    ? (() => {
        // Filter names by category if selected
        const filteredNames = selectedCategory
          ? availableNames.filter(
              (name) =>
                name.categories && name.categories.includes(selectedCategory),
            )
          : availableNames;

        // Filter by search term
        const searchFilteredNames = searchTerm
          ? filteredNames.filter(
              (name) =>
                name.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (name.description &&
                  name.description
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase())),
            )
          : filteredNames;

        // Sort names
        return [...searchFilteredNames].sort((a, b) => {
          switch (sortBy) {
            case "rating":
              return (b.avg_rating || 1500) - (a.avg_rating || 1500);
            case "popularity":
              return (b.popularity_score || 0) - (a.popularity_score || 0);
            case "alphabetical":
              return a.name.localeCompare(b.name);
            default:
              return 0;
          }
        });
      })()
    : availableNames; // Non-admin users see all names

  return (
    <div className={styles.nameSelection}>
      <h2 className={styles.heading}>Pick multiple names you sorta like</h2>
      <p className={styles.selectionGuide}>
        You can pick as many as you want, but 2 is the minimum to start. The
        more you pick, the longer the tournament will take.
      </p>

      {/* Admin-only filtering and sorting controls */}
      {isAdmin && (
        <div className={styles.controlsSection}>
          {/* Category filter */}
          {categories && categories.length > 0 && (
            <div className={styles.filterGroup}>
              <label htmlFor="category-filter">Category:</label>
              <select
                id="category-filter"
                value={selectedCategory || ""}
                onChange={(e) => onCategoryChange(e.target.value || null)}
                className={styles.filterSelect}
              >
                <option value="">All Categories</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.name} (
                    {
                      availableNames.filter(
                        (name) =>
                          name.categories &&
                          name.categories.includes(category.name),
                      ).length
                    }
                    )
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Search filter */}
          <div className={styles.filterGroup}>
            <label htmlFor="search-filter">Search:</label>
            <input
              type="text"
              id="search-filter"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search names or descriptions..."
              className={styles.searchInput}
            />
          </div>

          {/* Sort options */}
          <div className={styles.filterGroup}>
            <label htmlFor="sort-filter">Sort by:</label>
            <select
              id="sort-filter"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className={styles.filterSelect}
            >
              <option value="alphabetical">Alphabetical</option>
              <option value="rating">Rating (High to Low)</option>
              <option value="popularity">Popularity</option>
            </select>
          </div>
        </div>
      )}

      {/* Admin-only results count */}
      {isAdmin && (
        <div className={styles.resultsInfo}>
          <span className={styles.resultsCount}>
            Showing {displayNames.length} of {availableNames.length} names
            {selectedCategory && ` in "${selectedCategory}" category`}
            {searchTerm && ` matching "${searchTerm}"`}
          </span>
        </div>
      )}

      <div className={styles.cardsContainer}>
        {displayNames.map((nameObj) => (
          <NameCard
            key={nameObj.id}
            name={nameObj.name}
            description={nameObj.description || DEFAULT_DESCRIPTION}
            isSelected={selectedNames.some((n) => n.id === nameObj.id)}
            onClick={() => onToggleName(nameObj)}
            size="small"
            // Admin-only metadata display
            metadata={
              isAdmin
                ? {
                    rating: nameObj.avg_rating,
                    popularity: nameObj.popularity_score,
                    tournaments: nameObj.total_tournaments,
                    categories: nameObj.categories,
                  }
                : undefined
            }
          />
        ))}
      </div>

      {isAdmin && displayNames.length === 0 && (
        <div className={styles.noResults}>
          <p>😿 No names found matching your criteria</p>
          <p>Try adjusting your filters or search terms</p>
        </div>
      )}
    </div>
  );
};

const StartButton = ({ selectedNames, onStart, variant = "default" }) => {
  const validateNames = (names) => {
    return names.every(
      (nameObj) =>
        nameObj &&
        typeof nameObj === "object" &&
        nameObj.name &&
        typeof nameObj.name === "string" &&
        nameObj.id,
    );
  };

  const handleStart = () => {
    if (!validateNames(selectedNames)) {
      console.error("Invalid name objects detected:", selectedNames);
      return;
    }
    onStart(selectedNames);
  };

  const buttonText =
    selectedNames.length < 2
      ? `Need ${2 - selectedNames.length} More Name${selectedNames.length === 0 ? "s" : ""} 🎯`
      : "Start Tournament! 🏆";

  const buttonClass =
    variant === "header" ? styles.startButtonHeader : styles.startButton;

  return (
    <button
      onClick={handleStart}
      className={buttonClass}
      disabled={selectedNames.length < 2}
      aria-label={
        selectedNames.length < 2
          ? "Select at least 2 names to start"
          : "Start Tournament"
      }
    >
      {buttonText}
    </button>
  );
};

const NameSuggestionSection = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { addName, loading } = useSupabaseStorage();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Please enter a name");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description");
      return;
    }

    try {
      await addName(name.trim(), description.trim());
      setSuccess("Thank you for your suggestion!");
      setName("");
      setDescription("");
    } catch (err) {
      setError("Failed to add name. It might already exist.");
    }
  };

  return (
    <div className={styles.suggestionSection}>
      <div className={styles.suggestionCard}>
        <h2>Suggest a Cat Name</h2>
        <p className={styles.suggestionIntro}>
          Have a great cat name in mind? Share it with the community!
        </p>

        <form onSubmit={handleSubmit} className={styles.suggestionForm}>
          <div className={styles.formGroup}>
            <label htmlFor="suggestion-name">Name</label>
            <input
              type="text"
              id="suggestion-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter a cat name"
              maxLength={50}
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="suggestion-description">Description</label>
            <textarea
              id="suggestion-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Tell us about this name's meaning or origin"
              maxLength={500}
              disabled={loading}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          <button
            type="submit"
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? "Submitting..." : "Submit Name"}
          </button>
        </form>
      </div>
    </div>
  );
};

function useTournamentSetup() {
  const [availableNames, setAvailableNames] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNames = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all names and hidden names in parallel for efficiency
        const [namesData, { data: hiddenData, error: hiddenError }] =
          await Promise.all([
            getNamesWithDescriptions(),
            supabase.from("cat_hidden_names").select("name_id"),
          ]);

        if (hiddenError) {
          throw hiddenError;
        }

        // Create Set of hidden IDs for O(1) lookup
        const hiddenIds = new Set(
          hiddenData?.map((item) => item.name_id) || [],
        );

        // Filter out hidden names
        const filteredNames = namesData.filter(
          (name) => !hiddenIds.has(name.id),
        );

        // Sort names alphabetically for better UX

        const sortedNames = filteredNames.sort((a, b) =>
          a.name.localeCompare(b.name),
        );

        devLog("🎮 TournamentSetup: Data loaded", {
          availableNames: sortedNames.length,
          hiddenNames: hiddenIds.size,
          userPreferences: hiddenData?.length || 0,
        });

        setAvailableNames(sortedNames);

        // If any currently selected names are now hidden, remove them
        setSelectedNames((prev) =>
          prev.filter((name) => !hiddenIds.has(name.id)),
        );
      } catch (err) {
        console.error("Error fetching names:", err);
        setError(`Failed to load names: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNames();
  }, []); // Empty dependency array since we only want to fetch once on mount

  const toggleName = (nameObj) => {
    setSelectedNames((prev) => {
      const newSelectedNames = prev.some((n) => n.id === nameObj.id)
        ? prev.filter((n) => n.id !== nameObj.id)
        : [...prev, nameObj];

      // Log the updated selected names
      devLog("🎮 TournamentSetup: Selected names updated", newSelectedNames);

      return newSelectedNames;
    });
  };

  const handleSelectAll = () => {
    setSelectedNames(
      selectedNames.length === availableNames.length ? [] : [...availableNames],
    );
  };

  return {
    availableNames,
    selectedNames,
    isLoading,
    error,
    toggleName,
    handleSelectAll,
  };
}

function TournamentSetupContent({ onStart }) {
  const {
    availableNames,
    selectedNames,
    isLoading,
    error,
    toggleName,
    handleSelectAll,
  } = useTournamentSetup();

  // Enhanced state for new features
  const [isExpanded, setIsExpanded] = useState(false);
  const [openImages, setOpenImages] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("alphabetical");

  // Get categories and other enhanced data
  const { categories } = useSupabaseStorage();

  // Simple admin detection - user "aaron" gets admin features
  // TODO: Replace with actual user authentication check
  // Example: const isAdmin = userName === "aaron" || userRole === "admin";
  const isAdmin = false; // Set to false to show simplified view by default

  const handleImageOpen = (image) => {
    setOpenImages((prev) => {
      if (prev.some((img) => img.src === image)) {
        return prev;
      }
      return [
        ...prev,
        {
          src: image,
          position: { x: 0, y: 0 },
          isDragging: false,
          dragStart: { x: 0, y: 0 },
          isMinimized: false,
          size: { width: 90, height: 90 },
          isResizing: false,
          resizeStart: { x: 0, y: 0 },
        },
      ];
    });
  };

  const handleImageClose = (imageSrc) => {
    setOpenImages((prev) => prev.filter((img) => img.src !== imageSrc));
  };

  const handleMinimize = (imageSrc) => {
    setOpenImages((prev) =>
      prev.map((img) => {
        if (img.src === imageSrc) {
          return {
            ...img,
            isMinimized: !img.isMinimized,
          };
        }
        return img;
      }),
    );
  };

  const handleMouseDown = (imageSrc, e) => {
    setOpenImages((prev) =>
      prev.map((img) => {
        if (img.src === imageSrc) {
          return {
            ...img,
            isDragging: true,
            dragStart: {
              x: e.clientX - img.position.x,
              y: e.clientY - img.position.y,
            },
          };
        }
        return img;
      }),
    );
  };

  const handleMouseMove = (e) => {
    setOpenImages((prev) =>
      prev.map((img) => {
        if (img.isDragging) {
          return {
            ...img,
            position: {
              x: e.clientX - img.dragStart.x,
              y: e.clientY - img.dragStart.y,
            },
          };
        }
        return img;
      }),
    );
  };

  const handleMouseUp = () => {
    setOpenImages((prev) =>
      prev.map((img) => ({
        ...img,
        isDragging: false,
      })),
    );
  };

  const handleResizeStart = (imageSrc, e, handle) => {
    e.stopPropagation();
    setOpenImages((prev) =>
      prev.map((img) => {
        if (img.src === imageSrc) {
          return {
            ...img,
            isResizing: true,
            resizeHandle: handle,
            resizeStart: {
              x: e.clientX,
              y: e.clientY,
            },
          };
        }
        return img;
      }),
    );
  };

  const handleResizeMove = (e) => {
    setOpenImages((prev) =>
      prev.map((img) => {
        if (img.isResizing) {
          const deltaX = e.clientX - img.resizeStart.x;
          const aspectRatio = img.size.width / img.size.height;

          let newWidth = img.size.width;
          let newHeight = img.size.height;

          switch (img.resizeHandle) {
            case "nw":
              newWidth = Math.max(200, img.size.width - deltaX);
              newHeight = newWidth / aspectRatio;
              break;
            case "ne":
              newWidth = Math.max(200, img.size.width + deltaX);
              newHeight = newWidth / aspectRatio;
              break;
            case "sw":
              newWidth = Math.max(200, img.size.width - deltaX);
              newHeight = newWidth / aspectRatio;
              break;
            case "se":
              newWidth = Math.max(200, img.size.width + deltaX);
              newHeight = newWidth / aspectRatio;
              break;
          }

          return {
            ...img,
            size: {
              width: newWidth,
              height: newHeight,
            },
            resizeStart: {
              x: e.clientX,
              y: e.clientY,
            },
          };
        }
        return img;
      }),
    );
  };

  const handleResizeEnd = () => {
    setOpenImages((prev) =>
      prev.map((img) => ({
        ...img,
        isResizing: false,
        resizeHandle: null,
      })),
    );
  };

  useEffect(() => {
    const hasDragging = openImages.some((img) => img.isDragging);
    const hasResizing = openImages.some((img) => img.isResizing);

    if (hasDragging || hasResizing) {
      window.addEventListener(
        "mousemove",
        hasResizing ? handleResizeMove : handleMouseMove,
      );
      window.addEventListener(
        "mouseup",
        hasResizing ? handleResizeEnd : handleMouseUp,
      );
      return () => {
        window.removeEventListener(
          "mousemove",
          hasResizing ? handleResizeMove : handleMouseMove,
        );
        window.removeEventListener(
          "mouseup",
          hasResizing ? handleResizeEnd : handleMouseUp,
        );
      };
    }
  }, [openImages]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h2>Error Loading Names</h2>
          <p className={styles.errorMessage}>{error}</p>
        </div>
      </div>
    );
  }

  if (availableNames.length === 0) {
    return (
      <div className={styles.container}>
        <h2>No Names Available</h2>
        <p className={styles.errorMessage}>
          There are no names available for the tournament at this time.
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.mainContent}>
        {/* Selection Panel */}
        <div className={styles.selectionPanel}>
          <div className={styles.panelHeader}>
            <div className={styles.headerRow}>
              <div className={styles.headerContent}>
                <h2 className={styles.panelTitle}>
                  Select Tournament Competitors
                </h2>
                <p className={styles.panelSubtitle}>
                  Choose at least 2 names to start your tournament
                </p>
              </div>
              <div className={styles.headerActions}>
                <button
                  onClick={handleSelectAll}
                  className={styles.selectAllButton}
                  aria-label={
                    selectedNames.length === availableNames.length
                      ? "Clear all selections"
                      : "Select all names"
                  }
                >
                  {selectedNames.length === availableNames.length
                    ? "✨ Start Fresh"
                    : "🎲 Select All"}
                </button>

                {selectedNames.length >= 2 && (
                  <StartButton
                    selectedNames={selectedNames}
                    onStart={onStart}
                    variant="header"
                  />
                )}
              </div>
            </div>

            {/* Name count for all users */}
            <div className={styles.nameCount}>
              <span className={styles.countText}>
                {selectedNames.length === 0
                  ? "Pick some pawsome names! 🐾"
                  : `${selectedNames.length} Names Selected`}
              </span>

              {selectedNames.length === 1 && (
                <span className={styles.helperText} role="alert">
                  Just one more to start! 🎯
                </span>
              )}
            </div>

            {/* Admin-only enhanced statistics */}
            {isAdmin && (
              <div className={styles.nameStats}>
                <span className={styles.statItem}>
                  📊 {availableNames.length} total names
                </span>
                <span className={styles.statItem}>
                  ⭐{" "}
                  {availableNames.length > 0
                    ? Math.round(
                        availableNames.reduce(
                          (sum, name) => sum + (name.avg_rating || 1500),
                          0,
                        ) / availableNames.length,
                      )
                    : 1500}{" "}
                  avg rating
                </span>
                <span className={styles.statItem}>
                  🔥{" "}
                  {
                    availableNames.filter(
                      (name) => (name.popularity_score || 0) > 5,
                    ).length
                  }{" "}
                  popular names
                </span>
              </div>
            )}
          </div>

          <NameSelection
            selectedNames={selectedNames}
            availableNames={availableNames}
            onToggleName={toggleName}
            isAdmin={isAdmin}
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {selectedNames.length >= 2 && (
            <div className={styles.startSection}>
              <StartButton selectedNames={selectedNames} onStart={onStart} />
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarCard}>
            <div className={styles.tournamentHeader}>
              <h1 className={styles.tournamentTitle}>🏆 Cat Name Tournament</h1>
              <p className={styles.tournamentSubtitle}>
                Pick the perfect name for your cat through fun head-to-head
                battles!
              </p>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressBar}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: `${Math.max((selectedNames.length / Math.max(availableNames.length, 1)) * 100, 5)}%`,
                  }}
                />
              </div>
              <span className={styles.progressText}>
                {selectedNames.length} of {availableNames.length} names selected
              </span>
            </div>

            <div className={styles.starsSection}>
              <h3 className={styles.starsTitle}>Cat Photos 📸</h3>
              <p className={styles.starsDescription}>
                Click any photo to get a closer look
              </p>
              <div className={styles.photoGrid}>
                {CAT_IMAGES.map((image, index) => (
                  <div
                    key={image}
                    className={styles.photoThumbnail}
                    onClick={() => handleImageOpen(image)}
                    role="button"
                    tabIndex={0}
                    aria-label={`View cat photo ${index + 1}`}
                  >
                    <img
                      src={`/images/${image}`}
                      alt={`Cat photo ${index + 1}`}
                      loading="lazy"
                      decoding="async"
                      width="200"
                      height="200"
                    />
                    <div className={styles.photoOverlay}>
                      <span className={styles.photoIcon}>👁️</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={styles.sidebarCard}>
            <NameSuggestionSection />
          </div>

          <div className={styles.sidebarCard}>
            <WelcomeSection
              isExpanded={isExpanded}
              setIsExpanded={setIsExpanded}
              categories={categories}
              isAdmin={isAdmin}
            />
          </div>
        </aside>
      </div>

      {openImages.map((image) => (
        <div
          key={image.src}
          className={`${styles.overlayBackdrop} ${image.isMinimized ? styles.minimized : ""}`}
          onClick={() => handleImageClose(image.src)}
        >
          <div className={styles.overlayContent}>
            <div
              className={`${styles.imageWrapperDynamic} ${styles.imageWrapper}`}
              style={{
                width: `${image.size.width}%`,
                height: `${image.size.height}%`,
                transform: `translate(${image.position.x}px, ${image.position.y}px)`,
              }}
            >
              <img
                src={`/images/${image.src}`}
                alt="Enlarged cat photo"
                className={`${styles.enlargedImage} ${image.isMinimized ? styles.minimizedImage : ""} ${image.isDragging ? styles.imageWrapperDragging : styles.imageWrapperNotDragging}`}
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleMouseDown(image.src, e);
                }}
                loading="eager"
                decoding="async"
              />
              {!image.isMinimized && (
                <>
                  <div
                    className={`${styles.resizeHandle} ${styles.nw}`}
                    onMouseDown={(e) => handleResizeStart(image.src, e, "nw")}
                  />
                  <div
                    className={`${styles.resizeHandle} ${styles.ne}`}
                    onMouseDown={(e) => handleResizeStart(image.src, e, "ne")}
                  />
                  <div
                    className={`${styles.resizeHandle} ${styles.sw}`}
                    onMouseDown={(e) => handleResizeStart(image.src, e, "sw")}
                  />
                  <div
                    className={`${styles.resizeHandle} ${styles.se}`}
                    onMouseDown={(e) => handleResizeStart(image.src, e, "se")}
                  />
                </>
              )}
            </div>
            <div className={styles.imageControls}>
              <button
                className={styles.minimizeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleMinimize(image.src);
                }}
                aria-label={
                  image.isMinimized ? "Maximize image" : "Minimize image"
                }
              >
                {image.isMinimized ? "↗" : "↙"}
              </button>
              <button
                className={styles.closeButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageClose(image.src);
                }}
              >
                ×
              </button>
            </div>
            <p className={styles.imageInstructions}>
              Click and drag to pan • Drag corners to resize • Press ESC or
              click outside to close
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function TournamentSetup(props) {
  return (
    <ErrorBoundary>
      <TournamentSetupContent {...props} />
    </ErrorBoundary>
  );
}

TournamentSetup.displayName = "TournamentSetup";

TournamentSetup.propTypes = {
  onStart: PropTypes.func.isRequired,
};

export default TournamentSetup;
