
if __name__ == "__main__":
    with open('index.html', 'r') as fp:
        html = fp.read()
        si = html.find('</head>')
        html_new = html[:si] + '<style> img[src="images/hand.png"]{pointer-events: none} </style>' + html[si:]

    with open('index.html', 'w') as fp:            
            fp.write(html_new)
    
