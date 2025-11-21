// Fix dropdown closing issue when opening output files
// Wait for all scripts to load, including deferred MadCap scripts
window.addEventListener('load', function () {
    // Small delay to ensure MadCap scripts have initialized
    setTimeout(function () {
        // Prevent dropdowns from closing when clicking inside them or on links
        // Use capture phase to intercept events before they bubble up
        document.addEventListener('click', function (e) {
            var target = e.target;

            // Check if click is inside a dropdown body or on a link/button inside dropdown
            var clickedInsideDropdown =
                target.closest('.MCDropDownBody') ||
                (target.closest('.MCDropDown') &&
                    (target.tagName === 'A' ||
                        target.tagName === 'BUTTON' ||
                        target.tagName === 'INPUT'));

            // If clicking inside dropdown (but not on the hotspot), prevent closing
            if (clickedInsideDropdown && !target.closest('.MCDropDownHotSpot')) {
                e.stopPropagation();
                return;
            }

            // If clicking on hotspot, let it toggle but prevent document-level close
            if (target.closest('.MCDropDownHotSpot')) {
                // Allow the toggle to happen, but prevent it from triggering document-level close
                setTimeout(function () {
                    var dropdown = target.closest('.MCDropDown');
                    if (dropdown && dropdown.classList.contains('MCDropDown_Open')) {
                        // Ensure dropdown stays open after toggle
                        dropdown.classList.remove('MCDropDown_Closed');
                        dropdown.classList.add('MCDropDown_Open');
                    }
                }, 10);
                return;
            }

            // Only close dropdowns if clicking completely outside
            var clickedDropdown = target.closest('.MCDropDown');
            if (!clickedDropdown) {
                // Click outside all dropdowns - close all open dropdowns
                var openDropdowns = document.querySelectorAll('.MCDropDown_Open');
                openDropdowns.forEach(function (dropdown) {
                    dropdown.classList.remove('MCDropDown_Open');
                    dropdown.classList.add('MCDropDown_Closed');
                    var img = dropdown.querySelector('.MCDropDown_Image_Icon');
                    if (img) {
                        img.setAttribute('alt', 'Closed');
                    }
                    var link = dropdown.querySelector('.MCDropDownHotSpot');
                    if (link) {
                        link.setAttribute('aria-expanded', 'false');
                    }
                });
            }
        }, true); // Use capture phase

        // Additional protection: stop propagation on all clicks inside dropdown bodies
        var dropdownBodies = document.querySelectorAll('.MCDropDownBody');
        dropdownBodies.forEach(function (body) {
            body.addEventListener(
                'click',
                function (e) {
                    // Don't stop if clicking on a link that should navigate
                    if (
                        e.target.tagName === 'A' &&
                        e.target.href &&
                        e.target.href !== 'javascript:void(0)'
                    ) {
                        // Allow navigation, but prevent dropdown from closing
                        e.stopPropagation();
                    } else if (e.target.tagName !== 'A' || e.target.href === 'javascript:void(0)') {
                        e.stopPropagation();
                    }
                },
                true
            );
        });
    }, 200); // Delay to ensure MadCap scripts are ready
});

