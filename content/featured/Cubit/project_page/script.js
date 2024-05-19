document.addEventListener('DOMContentLoaded', function () {
    const sections = document.querySelectorAll('.section');
    const progressBars = document.querySelectorAll('.progress-bar');
    let currentSectionIndex = 0;
    let progress = 0; // Percentage of the current progress bar
    let lastSectionIndex = 0; // Track the last section index for direction determination

    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');

    function adjustMargin() {
        const sidebarWidth = sidebar.offsetWidth; // Get the width of the sidebar
        mainContent.style.marginLeft = `calc(${sidebarWidth}px + var(--left-margin-content) + 50px)`;
    }
    // Call adjustMargin initially and whenever the window is resized
    adjustMargin();
    window.addEventListener('resize', adjustMargin);


    function adjustSidebarHeight() {
        const mainContentHeight = mainContent.offsetHeight;
        sidebar.style.height = `${mainContentHeight}px`;
    }

    // document.addEventListener('DOMContentLoaded', adjustSidebarWidth);

    // // Adjust the sidebar width on window resize as well
    // window.addEventListener('resize', adjustSidebarWidth);

    // function adjustSidebarWidth() {
    //     const sidebar = document.querySelector('.sidebar');
    //     // Determine the maximum allowed height (viewport height - top margin)
    //     // const maxHeight = window.innerHeight - parseFloat(getComputedStyle(sidebar).marginTop);
    //     maxHeight = mainContent.offsetHeight;
    //     // get the height of all the sections in sidebar
    //     const sections = document.querySelectorAll('.section');
    //     let totalHeight = 0;
    //     maxSectionHeight = sections[0].offsetHeight;
    //     console.log("maxSectionHeight: ", maxSectionHeight);



    // console.log("scrollHeight: ", sidebar.scrollHeight);
    // console.log("maxHeight: ", maxHeight);

    // var count = 0;

    // while (sidebar.scrollHeight > maxHeight) {
    //     count += 1;

    //     console.log("scrollHeight: ", sidebar.scrollHeight);
    //     console.log("maxHeight: ", maxHeight);
    //     console.log("sidebar.offsetWidth: ", sidebar.offsetWidth);
    //     let newWidth = sidebar.offsetWidth + 5;
    //     sidebar.style.maxWidth = `${newWidth}px`;

    //     if (count > 400) {
    //         count = 0;
    //         break;
    //     }
    // }
    // count = 0;

    // while (sidebar.scrollHeight < maxHeight) {
    //     count += 1;

    //     console.log("scrollHeight: ", sidebar.scrollHeight);
    //     console.log("maxHeight: ", maxHeight);
    //     console.log("sidebar.offsetWidth: ", sidebar.offsetWidth);
    //     let newWidth = sidebar.offsetWidth - 5;
    //     sidebar.style.maxWidth = `${newWidth}px`;

    //     if (count > 400) {
    //         count = 0;
    //         break;
    //     }
    // }

    // // Check if the sidebar's height exceeds the maximum allowed height
    // if (sidebar.scrollHeight > maxHeight) {
    //     // Increase the sidebar's width to try to accommodate content within the vertical space
    //     // This increases the width by 20px each time it's called and runs out of vertical space
    //     // Adjust this increment value as necessary
    //     let newWidth = sidebar.offsetWidth + 10;
    //     sidebar.style.width = `${newWidth}px`;

    //     // Recursively call this function until the content fits or reaches a maximum width limit
    //     // Here, a maximum width of 400px is used as an example; adjust as needed
    //     if (newWidth <= 400) {
    //         adjustSidebarWidth();
    //     }
    // }
    // else {
    //     // If the sidebar's height is within the maximum allowed height, set the width to auto
    //     sidebar.style.width = 'auto';
    //     let newWidth = sidebar.offsetWidth - 10;
    //     sidebar.style.width = `${newWidth}px`;

    //     // Recursively call this function until the content fits or reaches a maximum width limit
    //     // Here, a maximum width of 400px is used as an example; adjust as needed
    //     if (newWidth <= 400) {
    //         adjustSidebarWidth();
    //     }
    // }
    // }


    // adjustSidebarWidth();
    // window.addEventListener('resize', adjustSidebarWidth);

    // adjustSidebarHeight();
    // window.addEventListener('resize', adjustSidebarHeight);

    function calculateTotalPaddingAndMargins() {
        const paddingTopAndBottom = 100; // 20px top + 20px bottom from the sidebar padding
        const sections = document.querySelectorAll('.sidebar .section');
        const marginsBetweenSections = (sections.length - 1) * 10; // 20px margin-bottom for each section except the last one

        // If there are other fixed elements inside the sidebar, add their heights + any margins/paddings they have here
        const fixedElementsHeight = 0; // Adjust this if you have fixed height elements inside your sidebar

        return paddingTopAndBottom + marginsBetweenSections + fixedElementsHeight;
    }


    function adjustSectionHeightAndWidth() {
        const sidebar = document.querySelector('.sidebar');
        const computedStyle = getComputedStyle(document.documentElement);

        // Parsing CSS variables to integers
        const contentMargin = parseInt(computedStyle.getPropertyValue('--content-margin'), 10);
        const navbarHeight = parseInt(computedStyle.getPropertyValue('--navbar-height'), 10);

        // Calculating sidebarHeight in JavaScript
        const sidebarHeight = sidebar.offsetHeight - (2 * contentMargin) - navbarHeight - 100;



        // const sidebarHeight = `calc(${sidebar.offsetHeight}px - (2 * var(--content-margin)) - var(--navbar-height) - 100px)`;
        // calc(100% - (2 * var(--content-margin)) - var(--navbar-height) - 100px);
        const numSections = sections.length;
        let totalPaddingAndMargins = calculateTotalPaddingAndMargins(); // Implement this based on your design
        let availableHeightPerSection = (sidebarHeight) / numSections;



        sections.forEach(section => {
            section.style.height = `${availableHeightPerSection}px`;
            if (availableHeightPerSection < 10) {
                section.style.height = `10px`;
            }
            // console.log("sidebarHeight: ", sidebarHeight, "totalPaddingAndMargins: ", totalPaddingAndMargins, "availableHeightPerSection: ", availableHeightPerSection);
            adjustWidthToFitContent(section);
        });
    }

    function adjustWidthToFitContent(section) {
        let trialWidth = section.offsetWidth;
        const maxWidth = 2000; // Maximum width you're willing to allow, adjust as needed
        console.log("trialWidth: ", trialWidth, "maxWidth: ", maxWidth);
        console.log("section.scrollHeight: ", section.scrollHeight, "section.offsetHeight: ", section.offsetHeight);

        while (section.scrollHeight > section.offsetHeight && trialWidth < maxWidth) {
            console.log("trialWidth: ", trialWidth, "maxWidth: ", maxWidth);
            console.log("section.scrollHeight: ", section.scrollHeight, "section.offsetHeight: ", section.offsetHeight);
            trialWidth += 5; // Increment width
            sidebar.style.width = `${trialWidth}px`; // Adjust sidebar width
            section.style.width = `${trialWidth}px`; // Adjust section width to match sidebar
        }
    }

    // Call this function initially and whenever the window is resized
    // window.addEventListener('resize', adjustSectionHeightAndWidth);
    // adjustSectionHeightAndWidth();


    // function adjustSectionHeight() {
    //     const numSections = sections.length;
    //     const sidebarHeight = sidebar.offsetHeight;
    //     const sectionHeight = (sidebarHeight - (numSections - 1) * 20) / numSections; // Adjusting for margins
    //     sections.forEach(section => {
    //         section.style.height = `${sectionHeight}px`;
    //     });
    // }

    // // Call adjustSectionHeight initially and whenever the window is resized
    // adjustSectionHeight();
    // window.addEventListener('resize', adjustSectionHeight);



    // Function to update the appearance of all sections based on the current active section
    function updateSectionsAppearance() {
        sections.forEach((section, index) => {
            if (index === currentSectionIndex) {
                section.classList.add('active');
                section.classList.remove('inactive');
            } else {
                section.classList.remove('active');
                section.classList.add('inactive');
            }
        });
    }

    function updateMainContentImage(sectionIndex) {
        // const images = ['pcb_layout.png', 'pcb_schematic.png', 'pcb_cad.png'];
        const images = ['pcb_cad.png', 'pcb_schematic.png', 'pcb_layout.png'];
        const direction = sectionIndex > lastSectionIndex;
        const isInitialLoad = mainContent.querySelectorAll('img').length === 0;

        // if (direction) { // If scrolling down
        //     newImg.classList.add('slide-image-in');
        // } else { // If scrolling up
        //     newImg.classList.add('slide-image-out');
        // }

        if (direction || isInitialLoad) { // Scrolling down or initial load
            const newImg = document.createElement('img');
            newImg.src = `images/${images[sectionIndex]}`;
            newImg.classList.add('slide-image');

            newImg.style.zIndex = '1';
            newImg.style.position = 'absolute';
            newImg.style.top = '0';
            newImg.style.left = '0';
            // Use immediate placement for the first image, no animation
            if (isInitialLoad) {
                newImg.style.transform = 'translateX(0)';
            } else {
                // newImg.style.animation = 'slideInRightToLeft 0.5s forwards';

                if (direction) { // If scrolling down
                    newImg.classList.add('slide-image-in');
                    newImg.classList.remove('slide-image-out');
                } else { // If scrolling up
                    newImg.classList.add('slide-image-out');
                    newImg.classList.remove('slide-image-in');
                }
            }
            mainContent.appendChild(newImg);
        } else { // Scrolling up
            const lastImg = mainContent.querySelector('img:last-child');
            if (lastImg) {
                lastImg.style.animation = 'slideOutLeftToRight 0.5s forwards';
                lastImg.addEventListener('animationend', () => {
                    lastImg.remove();
                });
            }
        }

        if (!isInitialLoad) {
            lastSectionIndex = sectionIndex; // Update only if not initial load
        }
    }






    // Initial image load for the first section
    updateMainContentImage(0);

    // Initially set all sections except the first to inactive
    updateSectionsAppearance();

    // Set the progress for a specific section
    function updateProgress(sectionIndex, progress) {
        if (sectionIndex < progressBars.length) {
            progressBars[sectionIndex].style.height = `${progress}%`;
        }
    }

    // Detect the scroll direction and update progress accordingly
    window.addEventListener('wheel', (event) => {
        event.preventDefault(); // Prevent the default scrolling
        const delta = Math.sign(event.deltaY);

        if (delta > 0) { // Scrolling down
            if (progress < 100) {
                progress += 10; // Increment progress
                updateProgress(currentSectionIndex, progress);
            }
            if (progress >= 100 && currentSectionIndex < progressBars.length - 1) {
                currentSectionIndex++; // Move to next section
                updateMainContentImage(currentSectionIndex)
                progress = 0; // Reset progress
            }
        } else if (delta < 0) { // Scrolling up
            if (progress > 0) {
                progress -= 10; // Decrement progress
                updateProgress(currentSectionIndex, progress);
            }
            if (progress <= 0 && currentSectionIndex > 0) {
                currentSectionIndex--; // Move to previous section
                updateMainContentImage(currentSectionIndex)
                progress = 100; // Set progress to full for the previous section
            }
        }

        // Update the progress for the current section and appearance of all sections
        updateProgress(currentSectionIndex, progress);
        updateSectionsAppearance();
    });
});









