import React from 'react';

function NavBar() {

    const onMobileMenuHandle = () => {
        alert('!!!')
    }

    return (
        <>
            <nav>
                <div className='nav-wrapper px1 green darken-1'>
                    <a href="/" className="brand-logo">
                        <img className='log' src='logo.svg' alt='OpenApi-CodeGen' />
                        OpenApi-CodeGen
                    </a>
                    
                    <a href="#" onClick={ onMobileMenuHandle } data-target="mobile-menu" className="sidenav-trigger"><i className="material-icons">menu</i></a>
                    <ul id="nav-mobile" className="right hide-on-med-and-down">
                        <li><a href="sass.html">What is it?</a></li>
                        <li><a href="badges.html">Get start</a></li>
                        <li><a href="collapsible.html">Documentation</a></li>
                        <li><a href="collapsible.html">Example</a></li>
                        <li><a href="https://github.com/mapstruct/mapstruct">
                            <i className='fa fa-github px1'></i>
                            Code &amp; Issue</a></li>
                    </ul>
                </div>
            </nav>
            <ul className="sidenav" id="mobile-menu">
                <li><a href="sass.html">Sass</a></li>
                <li><a href="badges.html">Components</a></li>
                <li><a href="collapsible.html">Javascript</a></li>
                <li><a href="mobile.html">Mobile</a></li>
            </ul>
        </>
    );
}

export default NavBar;