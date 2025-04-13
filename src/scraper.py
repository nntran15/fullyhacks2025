from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import Select
from selenium.common.exceptions import NoSuchElementException
import pandas as pd
import time
import os

def setup_driver():
    chrome_options = Options()
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--headless=new") 
    chrome_options.add_argument("--disable-gpu") 
    chrome_options.add_argument("--no-sandbox")    

    driver = webdriver.Chrome(options=chrome_options)
    return driver

"""
    Scrape class information from CSUF class search using the exact element IDs
    
    Args:
        term: Specific term to search (e.g., "Spring 2025")
        subject: Specific subject to search (e.g., "Computer Science")
    
    Returns:
        DataFrame containing class information
"""
def scrape_csuf_classes(term=None, subject=None):
    url = "https://cmsweb.fullerton.edu/psc/CFULPRD/EMPLOYEE/SA/c/SA_LEARNER_SERVICES.CLASS_SEARCH.GBL?public"
    
    driver = setup_driver()
    print(f"Opening URL: {url}")
    driver.get(url)
    
    classes = []
    
    try:
        # Let the page load completely
        time.sleep(5)
        
        # Select term if provided
        if term:
            try:
                term_dropdown = Select(driver.find_element(By.ID, "CLASS_SRCH_WRK2_STRM$35$"))

                # testing purposes
                print("Available terms:")
                for option in term_dropdown.options:
                    print(f"  - {option.text}")
                
                # Select the term
                matching_terms = [opt.text for opt in term_dropdown.options if term.lower() in opt.text.lower()]
                if matching_terms:
                    print(f"Selecting term: {matching_terms[0]}")
                    term_dropdown.select_by_visible_text(matching_terms[0])
                    time.sleep(2) 
                else:
                    print(f"Term '{term}' not found in dropdown options")
            except Exception as e:
                print(f"Error selecting term: {e}")
        
        # Select subject if provided
        if subject:
            try:
                # Using the exact ID from the JSON
                subject_dropdown = Select(driver.find_element(By.ID, "SSR_CLSRCH_WRK_SUBJECT_SRCH$0"))
                
                # Subject
                matching_subjects = [opt.text for opt in subject_dropdown.options if subject.lower() in opt.text.lower()]
                if matching_subjects:
                    print(f"Selecting subject: {matching_subjects[0]}")
                    subject_dropdown.select_by_visible_text(matching_subjects[0])
                    time.sleep(2) 
                else:
                    print(f"Subject '{subject}' not found in dropdown options")
            except Exception as e:
                print(f"Error selecting subject: {e}")
        
        # Click the Search button
        try:
            # Using the exact ID from the JSON
            search_button = driver.find_element(By.ID, "CLASS_SRCH_WRK2_SSR_PB_CLASS_SRCH")
            search_button.click()
            time.sleep(5)
            
            # "too many results" warning bypass
            try:
                warning_ok_buttons = ["#ICYes", "#ICSave", "DERIVED_SSS_SCT_SSR_PB_GO"]
                for button_id in warning_ok_buttons:
                    try:
                        ok_button = driver.find_element(By.ID, button_id)
                        ok_button.click()
                        time.sleep(3)
                        break
                    except NoSuchElementException:
                        continue
            except Exception as warn_e:
                print(f"No warning dialog found or error handling warning: {warn_e}")
            
        except Exception as e:
            print(f"Error clicking search button: {e}")
        
        # Extract the class data
        try:
            # Wait for results to appear
            WebDriverWait(driver, 10).until(EC.presence_of_element_located((By.ID, "win0divSSR_CLSRSLT_WRK_GROUPBOX2$0")))
            
            # Count how many class sections there are
            section_elements = driver.find_elements(By.CSS_SELECTOR, "div[id^='win0divSSR_CLSRSLT_WRK_GROUPBOX2$']")
            print(f"Found {len(section_elements)} class sections")
            
            '''
            if not section_elements:
                print("No class results found. Looking for alternative selectors...")
                # Try alternative ways to find class data
                section_elements = driver.find_elements(By.CSS_SELECTOR, ".PSGROUPBOXWBO")
                print(f"Found {len(section_elements)} class sections using alternate selector")
            '''
            
            # Process each section
            for i, section_elem in enumerate(section_elements):
                try:
                    # Get the class name/title
                    try:
                        class_name_elem = section_elem.find_element(By.CSS_SELECTOR, ".PAGROUPBOXLABELLEVEL1")
                        class_name = class_name_elem.text.strip()
                    except:
                        try:
                            # Alternative class name location
                            class_name_elem = section_elem.find_element(By.CSS_SELECTOR, ".PSGROUPBOXLABEL")
                            class_name = class_name_elem.text.strip()
                        except:
                            class_name = f"Unknown Class {i+1}"
                    
                    print(f"Processing class: {class_name}")
                    
                    # Find all class meeting rows
                    meeting_rows = section_elem.find_elements(By.CSS_SELECTOR, "tr[id^='trSSR_CLSRCH_MTG1$']")
                    if not meeting_rows:
                        # Try alternative selector
                        meeting_rows = section_elem.find_elements(By.CSS_SELECTOR, ".PSLEVEL1GRID tr")
                    
                    print(f"  Found {len(meeting_rows)} meeting rows")
                    
                    for row in meeting_rows:
                        try:
                            cells = row.find_elements(By.TAG_NAME, "td")
                            
                            if len(cells) >= 5: 
                                # Extract the data
                                # cells[0].text.strip() = class_id
                                # class_name = class_name
                                # cells[1].text.strip() = section_number
                                # cells[3] = room

                                class_id = cells[0].text.strip()
                                # class_name defined
                                section_number = cells[1].text.strip()
                                times = cells[2].text.strip()
                                room = cells[3].text.strip()
                                instruction_type = cells[4].text.strip()
                                
                                classes.append({
                                    'Class ID': class_id,
                                    'Class Name': class_name,
                                    'Section': section_number,
                                    'Room': room,
                                    'Instruction Type': instruction_type,
                                    'Time': times
                                })
                                
                        except Exception as row_e:
                            print(f"    Error processing row: {row_e}")
                except Exception as section_e:
                    print(f"  Error processing section {i}: {section_e}")
            
        except Exception as e:
            print(f"Error extracting class data: {e}")
        
        return pd.DataFrame(classes)
        
    finally:
        print("Closing browser")
        driver.quit()

def save_to_csv(df, subject, term):
    filename = f"{subject}_{term}.csv"
    filepath = os.path.join("./csv", filename)
    df.to_csv(filepath, index=False)

if __name__ == "__main__":
    print("Starting CSUF class scraper...")
    term = "Fall 2025"
    subjects = [
        "African American Studies",
        "Aging Studies",
        "American Studies",
        "Anthropology",
        "Arabic",
        "Art",
        "Art Education",
        "Asian American Studies",
        "Astronomy",
        "Biological Science",
        "Business Administration",
        "Chemistry and Biochemistry",
        "Chicana and Chicano Studies",
        "Child and Adolescent Studies",
        "Chinese",
        "Cinema and Television Arts",
        "Civil & Environmental Engr",
        "Coll of Natural Sci & Math",
        "Comm Sciences and Disorders",
        "Communications",
        "Comparative Literature",
        "Computer Science",
        "Counseling",
        "Credential Studies",
        "Criminal Justice",
        "Dance",
        "Economics",
        "Education Leadership Doctorate",
        "Educational Leadership",
        "Electrical & Computer Engineer",
        "Elementary & Bilingual Ed",
        "English",
        "English Education",
        "Environmental Studies",
        "Finance",
        "French",
        "Gender and Sexuality Studies",
        "General Engineering",
        "Geography and the Environment",
        "Geological Sciences",
        "German",
        "Graduate Studies",
        "History",
        "Honors",
        "Human Communication Studies",
        "Human Services",
        "Humanities and Social Sciences",
        "Info Systems & Decision Sci",
        "Instructional Design & Tech",
        "International Studies",
        "International Studies",
        "Italian",
        "Japanese",
        "Kinesiology",
        "Korean",
        "Liberal Studies",
        "Linguistics",
        "Management",
        "Marketing",
        "Master of Social Work",
        "Math Education",
        "Mathematics",
        "Mechanical Engineering",
        "Military Science",
        "Modern Languages & Literatures",
        "Music",
        "Music Education",
        "Nursing",
        "Persian",
        "Philosophy",
        "Physics",
        "Political Science",
        "Portuguese",
        "Psychology",
        "Public Health",
        "Reading",
        "Registrar",
        "Religious Studies",
        "Secondary Education",
        "Sociology",
        "Spanish",
        "Special Education",
        "Teach English Spkrs Oth Lang",
        "Theatre",
        "University Studies",
        "Vietnamese"
    ]
    csv_directory = "./csv"
    os.makedirs(csv_directory, exist_ok=True)

    for subject in subjects:
        classes_df = scrape_csuf_classes(term, subject)

        if not classes_df.empty:
            print(f"Found {len(classes_df)} classes")
            save_to_csv(classes_df, subject, term)
            print(classes_df.head())
        else:
            print("No classes found or there was an issue with the search")