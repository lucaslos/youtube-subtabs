/* eslint-disable no-loop-func */
import { TabProps } from 'settingsApp/state/tabsState';
import { FilterProps } from 'settingsApp/state/filtersState';

export function checkIfExcludeVideo(
  {
    userName,
    userId,
    videoName,
    dayOfWeek,
  }: {
    userName: string;
    userId: string;
    videoName: string;
    dayOfWeek: number | null;
  },
  includeFilters: FilterProps[],
  excludeFilters: FilterProps[],
) {
  let includeVideo = false;
  let includeBasedOnFilter: number | undefined;
  const includeBasedOnFields: ('userName' | 'userId' | 'videoName')[] = [];
  const excludeBasedOnFields: typeof includeBasedOnFields = [];
  let excludeBasedOnFilter: typeof includeBasedOnFilter;

  function ifMatches(
    filter: FilterProps,
    callbacks: Record<'userName' | 'userId' | 'videoName', () => void> & {
      daysOfWeek?: () => void;
    },
  ) {
    let userMatches =
      !filter.userName && !filter.userId && !videoName
        ? false
        : !(filter.userName || filter.userId);

    if (filter.userName && filter.userName === userName) {
      userMatches = true;
      callbacks.userName();
    }

    if (!userMatches && filter.userId && filter.userId === userId) {
      userMatches = true;
      callbacks.userId();
    }

    let videoNameMatches = !videoName || !filter.videoNameRegex;

    if (
      userMatches &&
      filter.videoNameRegex &&
      videoName &&
      new RegExp(filter.videoNameRegex, 'i').test(videoName)
    ) {
      videoNameMatches = true;
      callbacks.videoName();
    }

    const dayOfWeekMatches =
      dayOfWeek === null ? true : filter.daysOfWeek.includes(dayOfWeek);
    if (dayOfWeekMatches) callbacks.daysOfWeek?.();

    return {
      videoNameMatches,
      userMatches,
      dayOfWeekMatches,
    };
  }

  if (includeFilters.length === 0) {
    includeVideo = true;
  } else {
    for (let i = 0; i < includeFilters.length; i++) {
      const filter = includeFilters[i];

      const { videoNameMatches, userMatches, dayOfWeekMatches } = ifMatches(
        filter,
        {
          userName: () => {
            includeBasedOnFields.push('userName');
          },
          userId: () => {
            includeBasedOnFields.push('userId');
          },
          videoName: () => {
            includeBasedOnFields.push('videoName');
          },
        },
      );

      if (videoNameMatches && userMatches && dayOfWeekMatches) {
        includeBasedOnFilter = filter.id;
        includeVideo = true;
        break;
      }
    }
  }

  if (includeVideo) {
    for (let i = 0; i < excludeFilters.length; i++) {
      const filter = excludeFilters[i];

      const { videoNameMatches, userMatches, dayOfWeekMatches } = ifMatches(
        filter,
        {
          userName: () => {
            excludeBasedOnFields.push('userName');
          },
          userId: () => {
            excludeBasedOnFields.push('userId');
          },
          videoName: () => {
            excludeBasedOnFields.push('videoName');
          },
        },
      );

      if (videoNameMatches && userMatches && dayOfWeekMatches) {
        excludeBasedOnFilter = filter.id;
        includeVideo = false;
        break;
      }
    }
  }

  return {
    excludeVideo: !includeVideo,
    includeBasedOnFilter,
    includeBasedOnFields,
    excludeBasedOnFilter,
    excludeBasedOnFields,
  };
}

export function checkVideoElem(
  element: HTMLElement,
  includeFilters: FilterProps[],
  excludeFilters: FilterProps[],
) {
  const userNameElement = element.querySelector<HTMLAnchorElement>(
    '#channel-name a',
  );

  const videoName = element.querySelector<HTMLDivElement>('#video-title')
    ?.innerText;
  const userId = userNameElement?.href.replace(
    /https:\/\/www.youtube.com\/(user|channel)\//,
    '',
  );
  const userName = userNameElement?.innerText;
  const timeOfUpload = element.querySelector<HTMLSpanElement>(
    '#metadata-line > span:nth-child(2)',
  )?.innerText;

  if (!videoName || !userId || !userName) return false;

  const today = new Date();
  let dayOfWeek: number | null = null;

  if (timeOfUpload && /hour|minute/.test(timeOfUpload)) {
    const hours = /(\d+) hour/.exec(timeOfUpload)?.[1];
    const minutes = /(\d+) minute/.exec(timeOfUpload)?.[1];

    if (hours) {
      today.setHours(today.getHours() - +hours);
    } else if (minutes) {
      today.setMinutes(today.getMinutes() - +minutes);
    }

    dayOfWeek = today.getDay();
  }

  const excludeVideo = checkIfExcludeVideo(
    {
      userId,
      userName,
      videoName,
      dayOfWeek,
    },
    includeFilters,
    excludeFilters,
  );

  return {
    ...excludeVideo,
    videoName,
    userId,
    userName,
  };
}

let lastFilteredVideo = -1;
let lastRunId = '';

export function getActiveFilters(
  active: 'all' | number,
  tabs: TabProps[],
  filters: FilterProps[],
) {
  const activeTab = tabs.find(item => item.id === active);
  let activeFilters = filters.filter(item => item.tabs.includes(active));

  if (active !== 'all') {
    activeFilters = [
      ...filters.filter(item => item.tabs.includes('all')),
      ...activeFilters,
      ...(activeTab?.includeChildsFilter
        ? tabs
          .filter(item => item.parent === activeTab.id)
          .reduce(
            (prev, curr) => [
              ...prev,
              ...filters.filter(item => item.tabs.includes(curr.id)),
            ],
            [],
          )
        : []),
    ];
  }

  activeFilters = activeFilters.filter(
    (filter, index, self) =>
      (filter.userId !== '' || filter.videoNameRegex !== '') &&
      index === self.findIndex(t => t.id === filter.id),
  );

  return {
    excludeFilters: activeFilters.filter(item => item.type === 'exclude'),
    includeFilters: activeFilters.filter(item => item.type === 'include'),
    runId: JSON.stringify([activeTab?.id, activeFilters]),
  };
}

export function filterVideos(
  active: 'all' | number,
  tabs: TabProps[],
  filters: FilterProps[],
) {
  const videosElements = document.querySelectorAll<HTMLDivElement>(
    '#items > ytd-grid-video-renderer',
  );

  const { includeFilters, excludeFilters, runId } = getActiveFilters(
    active,
    tabs,
    filters,
  );

  if (runId !== lastRunId) {
    lastRunId = runId;
    lastFilteredVideo = -1;

    if (videosElements.length > 393) {
      window.location.reload(false);
      return;
    }
  }

  // console.time(`videos-${videosElements.length}`);

  for (let i = lastFilteredVideo + 1; i < videosElements.length; i++) {
    const videoProps = checkVideoElem(
      videosElements[i],
      includeFilters,
      excludeFilters,
    );

    if (videoProps) {
      // console.log(videoProps);
      if (videoProps.excludeVideo) {
        videosElements[i].style.display = 'none';
      } else {
        videosElements[i].style.display = 'block';
      }
    }
  }

  window.scrollBy(0, 1);
  window.scrollBy(0, -1);

  lastFilteredVideo = videosElements.length - 1;

  // console.timeEnd(`videos-${videosElements.length}`);
}
