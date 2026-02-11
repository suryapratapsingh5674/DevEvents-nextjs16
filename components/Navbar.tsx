"use client"

import Image from "next/image"
import Link from "next/link"
import posthog from "posthog-js"

const Navbar = () => {
  const handleLogoClick = () => {
    posthog.capture('logo_clicked')
  }

  const handleNavLinkClick = (linkName: string) => {
    posthog.capture('nav_link_clicked', {
      link_name: linkName,
    })
  }

  return (
    <header>
        <nav>
            <Link href='/' className="logo" onClick={handleLogoClick}>
                <Image src="/icons/logo1.png" alt="logo" width={24} height={24}/>
                <p>DevEvent</p>
            </Link>
            <ul>
                <Link href="/" onClick={() => handleNavLinkClick('Home')}>Home</Link>
                {/* <Link href="/" onClick={() => handleNavLinkClick('Events')}>Events</Link> */}
                <Link href="/events/create" onClick={() => handleNavLinkClick('Create Event')}>Create Event</Link>
            </ul>
        </nav>
    </header>
  )
}

export default Navbar