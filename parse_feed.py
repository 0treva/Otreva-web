import xml.etree.ElementTree as ET
import json
import re
from datetime import datetime

# Parse the RSS feed
tree = ET.parse('spiegel_feed.xml')
root = tree.getroot()

namespace = {'content': 'http://purl.org/rss/1.0/modules/content/'}

# The existing posts
initialBlogData = [
    {
        "id": 1,
        "title": "Welcome to the Underground",
        "author": "anonymous",
        "date": "2019-01-15T08:00:00Z",
        "content": "The internet is not just a network of computers. It's a battlefield of information, where knowledge is power and anonymity is freedom. This blog will serve as a chronicle of our journey through the digital realm.\n\nWe are the watchers in the shadows, the guardians of digital liberty. Our mission: to expose the truth, share knowledge, and push the boundaries of what's possible.\n\nStay alert. Stay curious. Stay anonymous.",
        "tags": ["announcement", "manifesto", "freedom"]
    },
    {
        "id": 2,
        "title": "Breaking Down Modern Encryption",
        "author": "spiegel",
        "date": "2019-03-20T14:30:00Z",
        "content": "In today's digital age, encryption is more than just a tool—it's a necessity. Let me break down some fundamental concepts:\n\nSymmetric vs Asymmetric: The eternal debate. Symmetric encryption uses the same key for encryption and decryption. Fast, but key distribution is a nightmare. Asymmetric uses key pairs—public and private. Slower, but elegant.\n\nThe real power comes from combining both. Use asymmetric to exchange a symmetric key, then encrypt bulk data with the symmetric algorithm. This is how TLS works, people.\n\nRemember: The algorithm may be public, but your keys are sacred. Guard them with your life.",
        "tags": ["security", "encryption", "tutorial"]
    },
    {
        "id": 3,
        "title": "My Journey into Reverse Engineering",
        "author": "otreva",
        "date": "2019-07-10T09:15:00Z",
        "content": "Reverse engineering is like digital archaeology. You're taking apart someone else's creation to understand how it works, why it works, and sometimes... how to make it work differently.\n\nStarted with simple programs, disassembling them byte by byte. The x86 assembly looked like hieroglyphics at first. But patterns emerge. You start to see the compiler's fingerprints, the programmer's habits.\n\nTools I cant live without: IDA Pro for static analysis, OllyDbg for dynamic debugging, and a LOT of coffee.\n\nThe best feeling? When you finally understand that one function that's been bugging you for days. It's like solving a puzzle nobody asked you to solve.",
        "tags": ["reverse-engineering", "assembly", "tools"]
    },
    {
        "id": 4,
        "title": "The Art of Social Engineering",
        "author": "anonymous",
        "date": "2019-10-05T18:45:00Z",
        "content": "The weakest link in any system isn't the technology—it's the human using it.\n\nSocial engineering is psychological manipulation at its finest. You're not hacking computers; you're hacking minds. Want access to a secure system? Don't brute-force the password. Call the help desk, pretend to be from IT, and ask them to reset it for you.\n\nKey principles:\n1. Build trust quickly\n2. Create urgency\n3. Use authority\n4. Never give them time to think\n\nBut remember: with great power comes great responsibility. Use this knowledge ethically. The goal is to understand vulnerabilities, not exploit people.",
        "tags": ["social-engineering", "psychology", "security"]
    },
    {
        "id": 5,
        "title": "Network Protocols: A Deep Dive",
        "author": "spiegel",
        "date": "2020-02-14T12:20:00Z",
        "content": "Let's talk about the backbone of the internet: protocols.\n\nTCP/IP is the foundation. TCP ensures reliable delivery—every packet acknowledged. IP handles routing. Together, they make the internet work.\n\nBut the interesting stuff happens at higher layers. HTTP is glorified text over TCP. DNS translates names to IPs—a distributed database vulnerable to poisoning. SMTP for email? Totally insecure without extensions.\n\nWant to really understand networks? Fire up Wireshark and watch the traffic. See those packets? Each one tells a story. HTTP headers leak information. DNS queries reveal browsing habits. TCP handshakes show connection patterns.\n\nKnowledge is intercepted packets properly analyzed.",
        "tags": ["networking", "protocols", "analysis"]
    },
    {
        "id": 6,
        "title": "Building Secure Systems",
        "author": "otreva",
        "date": "2020-05-28T23:59:00Z",
        "content": "As we close out the year, let's talk about building things the right way.\n\nSecurity isn't a feature you add at the end. It's a mindset you adopt from day one.\n\nPrinciples I live by:\n- Defense in depth: Multiple layers of security\n- Least privilege: Give minimum necessary access\n- Fail securely: When something breaks, it should lock down, not open up\n- Never trust user input: EVER\n\nThe Y2K bug taught us that shortcuts come back to haunt you. Write code like someone malicious will read it. Because they will.\n\nHere's to a new millennium of secure, robust systems. May your code be clean and your exploits be patched.",
        "tags": ["security", "best-practices", "development"]
    }
]

# Track next ID
next_id = 7

all_posts = list(initialBlogData)

for item in root.findall('./channel/item'):
    title = item.find('title').text
    pubDate = item.find('pubDate').text
    
    # Format date: "Sun, 17 Oct 2021 16:52:54 GMT" -> "2021-10-17T16:52:54Z"
    dt = datetime.strptime(pubDate, "%a, %d %b %Y %H:%M:%S %Z")
    date_str = dt.strftime("%Y-%m-%dT%H:%M:%SZ")
    
    content_encoded = item.find('content:encoded', namespace).text
    
    # Clean HTML: remove tags and decode some entities
    content_text = re.sub(r'<[^>]+>', '', content_encoded)
    content_text = content_text.replace('&nbsp;', ' ').replace('&#39;', "'").replace('&quot;', '"')
    content_text = content_text.replace('&lt;', '<').replace('&gt;', '>')
    
    # We can also extract Categories
    tags = []
    for cat in item.findall('category'):
        tags.append(cat.text)
        
    all_posts.append({
        "id": next_id,
        "title": title,
        "author": "spiegel",
        "date": date_str,
        "content": content_text.strip(),
        "tags": tags
    })
    next_id += 1

with open('blog-data.json', 'w', encoding='utf-8') as f:
    json.dump(all_posts, f, ensure_ascii=False, indent=4)

print(f"Created blog-data.json with {len(all_posts)} posts.")
