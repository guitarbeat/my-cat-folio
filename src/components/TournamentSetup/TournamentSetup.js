/**
 * @module TournamentSetup
 * @description Wizard for selecting cat names and starting a tournament.
 */
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { supabase, getNamesWithDescriptions } from '../../supabase/supabaseClient';
import devLog from '../../utils/logger';
import { LoadingSpinner, NameCard, ErrorBoundary } from '../';
import useNameOptions from '../../supabase/useNameOptions';
import styles from './TournamentSetup.module.css';


const CAT_IMAGES = [
  "IMG_4844.jpg",
  "IMG_4845.jpg",
  "IMG_4846.jpg",
  "IMG_4847.jpg",
  "IMG_5044.JPEG",
  "IMG_5071.JPG",
];

const DEFAULT_DESCRIPTION = "A name as unique as your future companion";

const WelcomeSection = ({ isExpanded, setIsExpanded }) => (
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
      </div>
    </div>
  </div>
);

const NameCounter = ({ selectedCount, totalCount, onSelectAll }) => (
  <div className={styles.nameCount}>
    <div className={styles.countAndSelect}>
      <span className={styles.countText}>
        {selectedCount === 0
          ? "Pick some pawsome names! 🐾"
          : `${selectedCount} Names Selected`}
      </span>
      <button
        onClick={onSelectAll}
        className={styles.selectAllButton}
        aria-label={
          selectedCount === totalCount
            ? "Clear all selections"
            : "Select all names"
        }
      >
        {selectedCount === totalCount ? "✨ Start Fresh" : "🎲 Select All"}
      </button>
    </div>
    {selectedCount === 1 && (
      <span className={styles.helperText} role="alert">
        Just one more to start! 🎯
      </span>
    )}
  </div>
);

const NameSelection = ({ selectedNames, availableNames, onToggleName }) => (
  <div className={styles.nameSelection}>
    <h2 className={styles.heading}>Pick multiple names you sorta like</h2>
    <p className={styles.selectionGuide}>
      You can pick as many as you want, but 2 is the minimum to start. The more
      you pick, the longer the tournament will take.
    </p>

    <div className={styles.cardsContainer}>
      {availableNames.map((nameObj) => (
        <NameCard
          key={nameObj.id}
          name={nameObj.name}
          description={nameObj.description || DEFAULT_DESCRIPTION}
          isSelected={selectedNames.some((n) => n.id === nameObj.id)}
          onClick={() => onToggleName(nameObj)}
          size="small"
          // shortcutHint={`Press Enter to ${selectedNames.some(n => n.id === nameObj.id) ? 'deselect' : 'select'} ${nameObj.name}`}
        />
      ))}
    </div>
  </div>
);

const StartButton = ({ selectedNames, onStart }) => {
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

  return (
    <div className={styles.startSection}>
      <button
        onClick={handleStart}
        className={styles.startButton}
        disabled={selectedNames.length < 2}
        aria-label={
          selectedNames.length < 2
            ? "Select at least 2 names to start"
            : "Start Tournament"
        }
      >
        {selectedNames.length < 2 ? (
          <>
            Need {2 - selectedNames.length} More Name
            {selectedNames.length === 0 ? "s" : ""} 🎯
          </>
        ) : (
          <>Start Tournament! 🏆</>
        )}
      </button>
    </div>
  );
};

const NameSuggestionSection = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { addNameOption, loading } = useNameOptions();

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
      await addNameOption(name.trim(), description.trim());
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
              placeholder="Tell us about this name&apos;s meaning or origin"
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
            supabase.from("hidden_names").select("name_id"),
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

        const sortedNames = filteredNames.sort((a, b) => a.name.localeCompare(b.name));
        
        devLog('🎮 TournamentSetup: Data loaded', {

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
      devLog('🎮 TournamentSetup: Selected names updated', newSelectedNames);

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

  const [isExpanded, setIsExpanded] = useState(false);
  const [openImages, setOpenImages] = useState([]);

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
      <div className={styles.tournamentLayout}>
        <aside className={styles.photoSidebar}>
          <div className={styles.photoSidebarContent}>
            <h3>Name This Star! 🌟</h3>
            <p>Help choose a name worthy of this fabulous feline</p>
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
                </div>
              ))}
            </div>
          </div>

          <NameSuggestionSection />
        </aside>

        <main className={styles.namesContent}>
          <WelcomeSection
            isExpanded={isExpanded}
            setIsExpanded={setIsExpanded}
          />

          <NameSelection
            selectedNames={selectedNames}
            availableNames={availableNames}
            onToggleName={toggleName}
          />

          <NameCounter
            selectedCount={selectedNames.length}
            totalCount={availableNames.length}
            onSelectAll={handleSelectAll}
          />

          {selectedNames.length >= 2 && (
            <StartButton selectedNames={selectedNames} onStart={onStart} />
          )}
        </main>

        {openImages.map((image) => (
          <div
            key={image.src}
            className={`${styles.overlayBackdrop} ${image.isMinimized ? styles.minimized : ""}`}
            onClick={() => handleImageClose(image.src)}
          >
            <div className={styles.overlayContent}>
              <div
                className={styles.imageWrapper}
                style={{
                  width: `${image.size.width}%`,
                  height: `${image.size.height}%`,
                  transform: `translate(${image.position.x}px, ${image.position.y}px)`,
                }}
              >
                <img
                  src={`/images/${image.src}`}
                  alt="Enlarged cat photo"
                  className={`${styles.enlargedImage} ${image.isMinimized ? styles.minimizedImage : ""}`}
                  style={{
                    cursor: image.isDragging ? "grabbing" : "grab",
                  }}
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
