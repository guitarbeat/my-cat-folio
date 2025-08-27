import React, { useMemo } from "react";
import PropTypes from "prop-types";
import NameCard from "../NameCard/NameCard";
import { SkeletonLoader } from "../LoadingSpinner";
import { FILTER_OPTIONS, TOURNAMENT } from "../../constants";
import styles from "./ProfileNameList.module.css";

/**
 * @module ProfileNameList
 * @description Displays the filtered and sorted list of names in the profile view.
 * Extracted from Profile component for better separation of concerns.
 */

const ProfileNameList = ({
  names = [],
  ratings = {},
  isLoading = false,
  filterStatus,
  userFilter,
  sortBy,
  sortOrder,
  isAdmin = false,
  onToggleVisibility,
  onDelete,
  onSelectionChange,
  selectedNames = new Set(),
  className = "",
  selectionFilter,
  selectionStats,
}) => {
  // * Filter and sort names based on current filters
  const filteredAndSortedNames = useMemo(() => {
    if (!names || names.length === 0) return [];

    let filtered = names;

    // * Apply status filter
    if (filterStatus === FILTER_OPTIONS.STATUS.ACTIVE) {
      filtered = filtered.filter((name) => !name.isHidden);
    } else if (filterStatus === FILTER_OPTIONS.STATUS.HIDDEN) {
      filtered = filtered.filter((name) => name.isHidden);
    }

    // * Apply user filter
    if (userFilter === FILTER_OPTIONS.USER.CURRENT) {
      filtered = filtered.filter((name) => name.user_name === ratings.userName);
    } else if (userFilter === FILTER_OPTIONS.USER.OTHER) {
      filtered = filtered.filter((name) => name.user_name !== ratings.userName);
    }

    // * NEW: Apply selection-based filters
    if (selectionFilter !== "all" && selectionStats) {
      switch (selectionFilter) {
        case "selected":
          // Filter to names that have been selected at least once
          filtered = filtered.filter((name) => {
            const selectionCount =
              selectionStats.nameSelectionCounts?.[name.id] || 0;
            return selectionCount > 0;
          });
          break;
        case "never_selected":
          // Filter to names that have never been selected
          filtered = filtered.filter((name) => {
            const selectionCount =
              selectionStats.nameSelectionCounts?.[name.id] || 0;
            return selectionCount === 0;
          });
          break;
        case "frequently_selected": {
          // Filter to names selected more than average
          const avgSelections = selectionStats.avgSelectionsPerName || 0;
          filtered = filtered.filter((name) => {
            const selectionCount =
              selectionStats.nameSelectionCounts?.[name.id] || 0;
            return selectionCount > avgSelections;
          });
          break;
        }
        case "recently_selected": {
          // Filter to names selected in the last 30 days
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          filtered = filtered.filter((name) => {
            const lastSelected = selectionStats.nameLastSelected?.[name.id];
            return lastSelected && new Date(lastSelected) > thirtyDaysAgo;
          });
          break;
        }
        default:
          break;
      }
    }

    // * Sort names - Enhanced with selection-based sorting
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case FILTER_OPTIONS.SORT.RATING:
          aValue = a.user_rating || TOURNAMENT.DEFAULT_RATING;
          bValue = b.user_rating || TOURNAMENT.DEFAULT_RATING;
          break;
        case FILTER_OPTIONS.SORT.NAME:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case FILTER_OPTIONS.SORT.WINS:
          aValue = a.user_wins || 0;
          bValue = b.user_wins || 0;
          break;
        case FILTER_OPTIONS.SORT.LOSSES:
          aValue = a.user_losses || 0;
          bValue = b.user_losses || 0;
          break;
        case FILTER_OPTIONS.SORT.WIN_RATE: {
          const aTotal = (a.user_wins || 0) + (a.user_losses || 0);
          const bTotal = (b.user_wins || 0) + (b.user_losses || 0);
          aValue = aTotal > 0 ? (a.user_wins || 0) / aTotal : 0;
          bValue = bTotal > 0 ? (b.user_losses || 0) / bTotal : 0;
          break;
        }
        case FILTER_OPTIONS.SORT.CREATED:
          aValue = new Date(a.created_at || 0);
          bValue = new Date(b.created_at || 0);
          break;
        // * NEW: Selection-based sorting options
        case "selection_count":
          aValue = selectionStats?.nameSelectionCounts?.[a.id] || 0;
          bValue = selectionStats?.nameSelectionCounts?.[b.id] || 0;
          break;
        case "last_selected":
          aValue = selectionStats?.nameLastSelected?.[a.id]
            ? new Date(selectionStats.nameLastSelected[a.id])
            : new Date(0);
          bValue = selectionStats?.nameLastSelected?.[b.id]
            ? new Date(selectionStats.nameLastSelected[b.id])
            : new Date(0);
          break;
        case "selection_frequency":
          aValue = selectionStats?.nameSelectionFrequency?.[a.id] || 0;
          bValue = selectionStats?.nameSelectionFrequency?.[b.id] || 0;
          break;
        case "tournament_appearances":
          aValue = a.total_tournaments || 0;
          bValue = b.total_tournaments || 0;
          break;
        default:
          aValue = a.user_rating || TOURNAMENT.DEFAULT_RATING;
          bValue = b.user_rating || TOURNAMENT.DEFAULT_RATING;
      }

      // * Handle string comparison
      if (typeof aValue === "string" && typeof bValue === "string") {
        if (sortOrder === FILTER_OPTIONS.ORDER.ASC) {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }

      // * Handle date comparison
      if (aValue instanceof Date && bValue instanceof Date) {
        if (sortOrder === FILTER_OPTIONS.ORDER.ASC) {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      }

      // * Handle numeric comparison
      if (sortOrder === FILTER_OPTIONS.ORDER.ASC) {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });

    return filtered;
  }, [
    names,
    filterStatus,
    userFilter,
    sortBy,
    sortOrder,
    ratings.userName,
    selectionFilter,
    selectionStats,
  ]);

  if (isLoading) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.loadingGrid}>
          {Array.from({ length: 6 }).map((_, index) => (
            <SkeletonLoader key={index} height={120} />
          ))}
        </div>
      </div>
    );
  }

  if (filteredAndSortedNames.length === 0) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className={styles.emptyState}>
          <h3 className={styles.emptyTitle}>No names found</h3>
          <p className={styles.emptyMessage}>
            {filterStatus !== FILTER_OPTIONS.STATUS.ALL ||
            userFilter !== FILTER_OPTIONS.USER.ALL
              ? "Try adjusting your filters to see more names."
              : "Start by creating your first tournament!"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>
          Names ({filteredAndSortedNames.length})
        </h3>
        {isAdmin && selectedNames.size > 0 && (
          <div className={styles.selectionInfo}>
            {selectedNames.size} name{selectedNames.size !== 1 ? "s" : ""}{" "}
            selected
          </div>
        )}
      </div>

      <div className={styles.namesGrid}>
        {filteredAndSortedNames.map((name) => {
          const isHidden = name.isHidden || false;
          const isSelected = selectedNames.has(name.id);

          return (
            <div
              key={name.id}
              className={`${styles.nameWrapper} ${isHidden ? styles.hiddenName : ""}`}
            >
              <NameCard
                name={name.name}
                description={
                  name.description ||
                  `Rating: ${name.user_rating || TOURNAMENT.DEFAULT_RATING}`
                }
                isSelected={isSelected}
                onClick={() => {}} // * No click action needed in profile view
                disabled={false}
                size="medium"
                metadata={{
                  rating:
                    name.user_rating ||
                    name.avg_rating ||
                    TOURNAMENT.DEFAULT_RATING,
                  popularity: name.popularity_score,
                  tournaments: name.total_tournaments,
                  categories: name.categories,
                  winRate:
                    name.user_wins && name.user_losses
                      ? Math.round(
                          (name.user_wins /
                            (name.user_wins + name.user_losses)) *
                            100,
                        )
                      : 0,
                  totalMatches: (name.user_wins || 0) + (name.user_losses || 0),
                  created: name.created_at,
                }}
                className={isHidden ? styles.hiddenNameCard : ""}
                isAdmin={isAdmin}
                isHidden={isHidden}
                onToggleVisibility={
                  isAdmin ? () => onToggleVisibility(name.id) : undefined
                }
                onDelete={isAdmin ? () => onDelete(name) : undefined}
                onSelectionChange={
                  isAdmin
                    ? (selected) => onSelectionChange(name.id, selected)
                    : undefined
                }
                showAdminControls={isAdmin}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

ProfileNameList.propTypes = {
  names: PropTypes.array,
  ratings: PropTypes.object,
  isLoading: PropTypes.bool,
  filterStatus: PropTypes.string.isRequired,
  userFilter: PropTypes.string.isRequired,
  sortBy: PropTypes.string.isRequired,
  sortOrder: PropTypes.string.isRequired,
  isAdmin: PropTypes.bool,
  onToggleVisibility: PropTypes.func,
  onDelete: PropTypes.func,
  onSelectionChange: PropTypes.func,
  selectedNames: PropTypes.instanceOf(Set),
  className: PropTypes.string,
  selectionFilter: PropTypes.string,
  selectionStats: PropTypes.object,
};

export default ProfileNameList;
