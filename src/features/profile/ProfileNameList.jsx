import React, { useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import NameCard from "../../shared/components/NameCard/NameCard";
import { SkeletonLoader, Card, Select } from "../../shared/components";
import { FILTER_OPTIONS, TOURNAMENT } from "../../core/constants";
import StatsCard from "../../shared/components/StatsCard/StatsCard";
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
  setFilterStatus,
  userFilter,
  setUserFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  isAdmin = false,
  onToggleVisibility,
  onDelete,
  onSelectionChange,
  selectedNames = new Set(),
  hiddenIds = new Set(),
  className = "",
  selectionFilter,
  setSelectionFilter,
  selectionStats,
  onBulkHide,
  onBulkUnhide,
  onFilteredCountChange,
  onApplyFilters,
  stats,
  highlights,
  filteredCount,
  totalCount,
}) => {
  // * Filter and sort names based on current filters
  const filteredAndSortedNames = useMemo(() => {
    if (!names || names.length === 0) return [];

    let filtered = names;

    const isNameHidden = (n) => Boolean(n.isHidden) || hiddenIds.has(n.id);

    // Debug logging
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 ProfileNameList filtering:", {
        totalNames: names.length,
        filterStatus,
        userFilter,
        sortBy,
        sortOrder,
        selectionFilter,
        hiddenIdsCount: hiddenIds.size,
        hiddenNamesInData: names.filter((n) => n.isHidden).length,
      });
    }

    // * Apply status filter
    if (filterStatus === FILTER_OPTIONS.STATUS.ACTIVE) {
      filtered = filtered.filter((name) => !isNameHidden(name));
    } else if (filterStatus === FILTER_OPTIONS.STATUS.HIDDEN) {
      filtered = filtered.filter((name) => isNameHidden(name));
    }

    // * Apply user filter
    // Only apply user filter if user_name exists on items
    if (
      names.length &&
      Object.prototype.hasOwnProperty.call(names[0], "user_name")
    ) {
      if (userFilter === FILTER_OPTIONS.USER.CURRENT) {
        filtered = filtered.filter(
          (name) => name.user_name === ratings.userName
        );
      } else if (userFilter === FILTER_OPTIONS.USER.OTHER) {
        filtered = filtered.filter(
          (name) => name.user_name !== ratings.userName
        );
      }
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
          bValue = bTotal > 0 ? (b.user_wins || 0) / bTotal : 0;
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

    // Debug logging after filtering
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 After filtering:", {
        filteredCount: filtered.length,
        originalCount: names.length,
      });
    }

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
    hiddenIds,
  ]);

  // * Report filtered count to parent component
  useEffect(() => {
    if (onFilteredCountChange) {
      onFilteredCountChange(filteredAndSortedNames.length);
    }
  }, [filteredAndSortedNames.length, onFilteredCountChange]);

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

  // * Handle select all functionality
  const handleSelectAll = () => {
    const allVisibleIds = filteredAndSortedNames.map((name) => name.id);
    const allSelected = allVisibleIds.every((id) => selectedNames.has(id));

    if (allSelected) {
      // Deselect all visible names
      allVisibleIds.forEach((id) => onSelectionChange?.(id, false));
    } else {
      // Select all visible names
      allVisibleIds.forEach((id) => onSelectionChange?.(id, true));
    }
  };

  // * Handle bulk hide/unhide
  const handleBulkHide = () => {
    const selectedIds = Array.from(selectedNames);
    onBulkHide?.(selectedIds);
  };

  const handleBulkUnhide = () => {
    const selectedIds = Array.from(selectedNames);
    onBulkUnhide?.(selectedIds);
  };

  // * Check if all visible names are selected
  const allVisibleSelected =
    filteredAndSortedNames.length > 0 &&
    filteredAndSortedNames.every((name) => selectedNames.has(name.id));

  // * Stats configuration - meaningful user activity data
  const STAT_CARD_SECTIONS = {
    base: [
      {
        key: "names_rated",
        title: "Names Rated",
        emoji: "⭐",
        variant: "primary",
        getValue: ({ names_rated = 0 }) => names_rated,
      },
      {
        key: "avg_rating_given",
        title: "Avg Rating Given",
        emoji: "📊",
        variant: "info",
        getValue: ({ avg_rating_given = 0 }) => Math.round(avg_rating_given),
      },
      {
        key: "active_ratings",
        title: "Active Ratings",
        emoji: "👁️",
        variant: "success",
        getValue: ({ active_ratings = 0 }) => active_ratings,
      },
      {
        key: "hidden_ratings",
        title: "Hidden Names",
        emoji: "🙈",
        variant: "secondary",
        getValue: ({ hidden_ratings = 0 }) => hidden_ratings,
      },
      {
        key: "high_ratings",
        title: "High Ratings",
        emoji: "🔥",
        variant: "warning",
        getValue: ({ high_ratings = 0 }) => high_ratings,
      },
      {
        key: "rating_range",
        title: "Rating Range",
        emoji: "📈",
        variant: "default",
        getValue: ({ min_rating_given = 0, max_rating_given = 0 }) =>
          `${Math.round(min_rating_given)}-${Math.round(max_rating_given)}`,
      },
    ],
    selection: [
      {
        key: "total_selections",
        title: "Total Selections",
        emoji: "🎯",
        variant: "primary",
        getValue: ({ total_selections = 0 }) => total_selections,
      },
      {
        key: "tournaments_participated",
        title: "Tournaments Played",
        emoji: "🏆",
        variant: "success",
        getValue: ({ tournaments_participated = 0 }) =>
          tournaments_participated,
      },
      {
        key: "unique_names_selected",
        title: "Unique Names",
        emoji: "🎲",
        variant: "info",
        getValue: ({ unique_names_selected = 0 }) => unique_names_selected,
      },
      {
        key: "most_selected_name",
        title: "Most Selected",
        emoji: "❤️",
        variant: "warning",
        getValue: ({ most_selected_name = "None" }) => most_selected_name,
      },
    ],
  };

  // * Filter options
  const statusOptions = [
    { value: FILTER_OPTIONS.STATUS.ALL, label: "All Names" },
    { value: FILTER_OPTIONS.STATUS.ACTIVE, label: "Active Only" },
    { value: FILTER_OPTIONS.STATUS.HIDDEN, label: "Hidden Only" },
  ];

  const userOptions = [
    { value: FILTER_OPTIONS.USER.ALL, label: "All Users" },
    { value: FILTER_OPTIONS.USER.CURRENT, label: "Current User" },
  ];

  const sortOptions = [
    { value: FILTER_OPTIONS.SORT.RATING, label: "Rating" },
    { value: FILTER_OPTIONS.SORT.NAME, label: "Name" },
    { value: FILTER_OPTIONS.SORT.WINS, label: "Wins" },
    { value: FILTER_OPTIONS.SORT.LOSSES, label: "Losses" },
    { value: FILTER_OPTIONS.SORT.WIN_RATE, label: "Win Rate" },
    { value: FILTER_OPTIONS.SORT.CREATED, label: "Created" },
  ];

  const selectionFilterOptions = [
    { value: "all", label: "All Names" },
    { value: "selected", label: "Selected Names" },
    { value: "never_selected", label: "Never Selected" },
    { value: "frequently_selected", label: "Frequently Selected" },
    { value: "recently_selected", label: "Recently Selected" },
  ];

  return (
    <div className={`${styles.container} ${className}`}>
      {/* Unified Stats & Filters */}
      {stats && (
        <div className={styles.unifiedSection}>
          <div className={styles.statsGrid}>
            {STAT_CARD_SECTIONS.base.map(
              ({ key, title, emoji, variant, getValue }) => (
                <StatsCard
                  key={key}
                  title={title}
                  value={getValue(stats)}
                  emoji={emoji}
                  variant={variant}
                  size="small"
                />
              )
            )}
            {selectionStats &&
              STAT_CARD_SECTIONS.selection.map(
                ({ key, title, emoji, variant, getValue }) => (
                  <StatsCard
                    key={key}
                    title={title}
                    value={getValue(selectionStats)}
                    emoji={emoji}
                    variant={variant}
                    size="small"
                  />
                )
              )}
          </div>

          {/* Highlights Section */}
          {highlights &&
            (highlights.topRated.length ||
              highlights.mostWins.length ||
              highlights.recent.length) > 0 && (
              <div className={styles.insightsSection}>
                <div className={styles.insightsGrid}>
                  {highlights.topRated.length > 0 && (
                    <Card
                      className={styles.insightCard}
                      variant="outlined"
                      padding="medium"
                      shadow="small"
                      background="transparent"
                    >
                      <div className={styles.insightContent}>
                        <h4>Top Rated</h4>
                        <ul className={styles.compactList}>
                          {highlights.topRated.map((i) => (
                            <li key={i.id} className={styles.compactItem}>
                              <span className={styles.itemName}>{i.name}</span>
                              <span className={styles.itemValue}>
                                {i.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  )}

                  {highlights.mostWins.length > 0 && (
                    <Card
                      className={styles.insightCard}
                      variant="outlined"
                      padding="medium"
                      shadow="small"
                      background="transparent"
                    >
                      <div className={styles.insightContent}>
                        <h4>Most Wins</h4>
                        <ul className={styles.compactList}>
                          {highlights.mostWins.map((i) => (
                            <li key={i.id} className={styles.compactItem}>
                              <span className={styles.itemName}>{i.name}</span>
                              <span className={styles.itemValue}>
                                {i.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  )}

                  {highlights.recent.length > 0 && (
                    <Card
                      className={styles.insightCard}
                      variant="outlined"
                      padding="medium"
                      shadow="small"
                      background="transparent"
                    >
                      <div className={styles.insightContent}>
                        <h4>Recent Updates</h4>
                        <ul className={styles.compactList}>
                          {highlights.recent.map((i) => (
                            <li key={i.id} className={styles.compactItem}>
                              <span className={styles.itemName}>{i.name}</span>
                              <span className={styles.itemValue}>
                                {i.value}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Card>
                  )}
                </div>
              </div>
            )}
        </div>
      )}
      {/* Filters */}
      <div className={styles.filterResults}>
        <span className={styles.resultsCount}>
          {filteredCount}/{totalCount}
        </span>
        {filteredCount !== totalCount && (
          <span className={styles.filteredIndicator}>filtered</span>
        )}
      </div>
      <div className={styles.filtersGrid}>
        <div className={styles.filterGroup}>
          <label>Status</label>
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            options={statusOptions}
            className={styles.filterSelect}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>User</label>
          <Select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            options={userOptions}
            className={styles.filterSelect}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Sort</label>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
            className={styles.filterSelect}
          />
        </div>

        <div className={styles.filterGroup}>
          <label>Order</label>
          <button
            type="button"
            onClick={() =>
              setSortOrder(
                sortOrder === FILTER_OPTIONS.ORDER.ASC
                  ? FILTER_OPTIONS.ORDER.DESC
                  : FILTER_OPTIONS.ORDER.ASC
              )
            }
            className={styles.sortOrderButton}
          >
            {sortOrder === FILTER_OPTIONS.ORDER.ASC ? "↑" : "↓"}
          </button>
        </div>

        {selectionStats && (
          <div className={styles.filterGroup}>
            <label>Selection</label>
            <Select
              value={selectionFilter}
              onChange={(e) => setSelectionFilter(e.target.value)}
              options={selectionFilterOptions}
              className={styles.filterSelect}
            />
          </div>
        )}

        <div className={styles.filterGroup}>
          <button
            type="button"
            onClick={onApplyFilters}
            className={styles.applyFiltersButton}
          >
            Apply
          </button>
        </div>
      </div>

      <div className={styles.header}>
        <h3 className={styles.sectionTitle}>
          Names ({filteredAndSortedNames.length})
        </h3>
        {isAdmin && (
          <div className={styles.headerControls}>
            {selectedNames.size > 0 && (
              <div className={styles.selectionInfo}>
                {selectedNames.size} name{selectedNames.size !== 1 ? "s" : ""}{" "}
                selected
              </div>
            )}
            {isAdmin && filteredAndSortedNames.length > 0 && (
              <div className={styles.bulkControls}>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className={styles.selectAllButton}
                  title={allVisibleSelected ? "Deselect All" : "Select All"}
                >
                  {allVisibleSelected ? "Deselect All" : "Select All"}
                </button>
                {selectedNames.size > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={handleBulkHide}
                      className={styles.bulkActionButton}
                      title="Hide Selected Names"
                    >
                      Hide Selected
                    </button>
                    <button
                      type="button"
                      onClick={handleBulkUnhide}
                      className={styles.bulkActionButton}
                      title="Unhide Selected Names"
                    >
                      Unhide Selected
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div className={styles.namesGrid}>
        {filteredAndSortedNames.map((name) => {
          const isHidden = Boolean(name.isHidden) || hiddenIds.has(name.id);
          const isSelected = selectedNames.has(name.id);

          return (
            <div
              key={name.id}
              className={`${styles.nameWrapper} ${isHidden ? styles.hiddenName : ""}`}
            >
              {isHidden && (
                <button
                  type="button"
                  className={styles.hiddenBadge}
                  title="Click to unhide"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleVisibility?.(name.id);
                  }}
                >
                  Hidden
                </button>
              )}
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
                            100
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
  setFilterStatus: PropTypes.func.isRequired,
  userFilter: PropTypes.string.isRequired,
  setUserFilter: PropTypes.func.isRequired,
  sortBy: PropTypes.string.isRequired,
  setSortBy: PropTypes.func.isRequired,
  sortOrder: PropTypes.string.isRequired,
  setSortOrder: PropTypes.func.isRequired,
  isAdmin: PropTypes.bool,
  onToggleVisibility: PropTypes.func,
  onDelete: PropTypes.func,
  onSelectionChange: PropTypes.func,
  selectedNames: PropTypes.instanceOf(Set),
  className: PropTypes.string,
  selectionFilter: PropTypes.string,
  setSelectionFilter: PropTypes.func,
  selectionStats: PropTypes.object,
  onBulkHide: PropTypes.func,
  onBulkUnhide: PropTypes.func,
  onFilteredCountChange: PropTypes.func,
  onApplyFilters: PropTypes.func,
  stats: PropTypes.object,
  highlights: PropTypes.object,
  filteredCount: PropTypes.number,
  totalCount: PropTypes.number,
};

export default ProfileNameList;
