import uuid
import bcrypt
from datetime import datetime, timezone

def _id():
    return str(uuid.uuid4())

def hash_pw(pw):
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()

ADMIN_ID = "admin-001"
MODULE_IDS = {
    "fire_earthquake": "mod-001",
    "health_diseases": "mod-002",
    "threat_response": "mod-003",
    "mental_health": "mod-004",
    "first_aid": "mod-005",
    "security_handover": "mod-006",
}

MODULES = [
    {
        "id": MODULE_IDS["fire_earthquake"],
        "title": "Fire & Earthquake",
        "description": "Fire evacuation protocols, assembly points, earthquake safety procedures, and winter evacuation guidelines.",
        "order": 1,
        "icon": "Flame",
        "content": [
            {
                "section_title": "Fire Activation and Evacuation Protocol",
                "section_text": "When a fire is detected, a continuous warning bell will sound throughout the building. All staff must immediately stop work and begin evacuation procedures. An intermittent or unusual alarm should also be treated as a potential emergency.\n\nStudents must line up quietly by their classroom door. Teachers are responsible for leading their groups to the designated assembly point, where they must conduct a register or headcount. Escape routes are based on the fire's location (refer to floor plan posted in each classroom).\n\nAssembly Points are located at the front and back of the building. In the event of a Critical Incident, assembly points may be moved further away as advised by the Headteacher.\n\nIMPORTANT: Do not return inside the building without explicit approval from the Principal."
            },
            {
                "section_title": "Assembly Points and Escape Routes",
                "section_text": "Primary Classrooms (Ground Floor): Line up, exit via back door, proceed to rear assembly points.\n\nYear 2B and Year 3: Exit through classroom front door, proceed to end of primary corridor, exit and turn right to rear assembly points.\n\nCanteen: Use canteen front fire exit door. Teachers lead students to front assembly point. Kitchen staff use the rear exit to rear assembly point.\n\nOutside During Playtime: Line students up and proceed to front assembly point.\n\nFirst Floor: Use main stairs or corridor through sports hall to exit via back right corner.\n\nSecond Floor: Proceed to ground floor, exit via staff entrance/exit, and assemble at the back."
            },
            {
                "section_title": "Winter Evacuation Procedure",
                "section_text": "During winter months, children will NOT collect their coats. Instead, blankets will be issued to keep students warm at assembly points.\n\nFire exits and pathways must remain clear at all times — no winter clothing, equipment, or obstacles should block evacuation routes.\n\nDuring after-school activities, the supervising teacher is responsible for evacuating students and taking attendance using club registers."
            },
            {
                "section_title": "Fire Roles and Responsibilities",
                "section_text": "Teachers: Call register or perform headcount at assembly point. Close all doors upon exiting the classroom. Maintain silence so students can hear instructions.\n\nSchool Administrator (Valeria/Marina/Galina): Brings all class registers to the main assembly point. Reports any missing students to the designated teacher.\n\nHead Teachers: Collect headcounts from teachers. Report totals to Principal and Health and Safety Officer.\n\nStudent Instructions: Stay calm. Line up quietly. Follow your teacher. Do not run or shout. Wait quietly at the assembly point.\n\nFire Warden Team: Ilia Shumilin, Kosmas Ourkeroglou, Maxim Vlasov, Elena Puzirevich, Dr. Christoforos Drousiotis, Ekaterina Shipilova.\n\nCommunications Manager: Elena Pyzirevitch."
            },
            {
                "section_title": "Earthquake: Signal and Immediate Actions",
                "section_text": "Unlike fire, there is NO alarm for an earthquake — the earthquake itself is the trigger for action.\n\nImmediately perform DROP, COVER, and HOLD ON:\n- DROP to the ground\n- Take COVER under a desk or sturdy furniture\n- HOLD ON until the shaking stops\n\nMovement begins only after shaking stops. The Primary classroom group is an exception — they evacuate immediately after shaking stops via pager signals."
            },
            {
                "section_title": "Safety During Shaking",
                "section_text": "Inside Classrooms: Take cover under desks or sturdy furniture. Protect your head and neck with your arms.\n\nIn Open Indoor Areas (Corridors, Halls): Move away from windows, exterior walls, glass, and tall unsecured objects. Protect your head and neck with your arms.\n\nOutdoors: Move away from buildings, trees, poles, and overhead hazards. Stay low and protect your head.\n\nNEVER run during shaking. Do not use elevators. Stay where you are until the shaking completely stops."
            },
            {
                "section_title": "Earthquake Evacuation After Shaking Stops",
                "section_text": "Primary Classrooms (Immediate Evacuation Group):\n- Receive evacuation signal via pagers\n- Evacuate immediately after shaking stops\n- Teachers lead students to assembly point using safe route\n- Report class status to Head of Primary\n\nFirst Floor & Second Floor (Standard Evacuation Group):\n- Evacuation begins only AFTER alarm and order from Health & Safety officer\n- Evacuate only after assessment confirms safety\n- Follow normal evacuation routes and assembly procedures\n\nIMPORTANT SEQUENCE:\n1. Shaking stops\n2. Safety assessment by H&S Lead\n3. Evacuation order given\n4. Standard groups evacuate"
            },
            {
                "section_title": "Earthquake Assembly and Special Situations",
                "section_text": "Assembly Areas: Use areas far from buildings, walls, windows, trees, and wires. Maintain class lines and complete roll call. Await instructions from the Health & Safety Lead.\n\nWinter Situations: Provide blankets, same as fire protocol.\n\nAfter-School Activities: Apply Drop-Cover-Hold On. Then evacuate once shaking stops and the order is given by the supervising teacher.\n\nStaff responsibilities follow the same structure as the fire evacuation plan. The Health & Safety Lead conducts the post-shake assessment and authorizes evacuation."
            }
        ]
    },
    {
        "id": MODULE_IDS["health_diseases"],
        "title": "Health & Transmissible Diseases",
        "description": "Illness reporting, hygiene practices, pandemic response plan, and color-coded risk scenarios.",
        "order": 2,
        "icon": "Heart",
        "content": [
            {
                "section_title": "Illness Reporting and Return-to-School Policy",
                "section_text": "All members of the school community must stay home if experiencing symptoms of illness, including fever, cough, sore throat, body aches, or gastrointestinal issues.\n\nReturn to school is permitted only after the individual has been symptom-free for at least 24 hours WITHOUT the aid of medication (such as fever-reducing drugs).\n\nThis policy applies equally to students, staff, and visitors. Early reporting prevents outbreaks and protects vulnerable members of the community."
            },
            {
                "section_title": "Notification and Reporting",
                "section_text": "Parents must inform the school immediately if their child is diagnosed with a transmissible disease.\n\nStaff members must notify their supervisor and the Health & Safety Officer without delay.\n\nAll reports are handled with strict confidentiality. The school will communicate confirmed cases to the wider community without identifying individuals, maintaining privacy and transparency."
            },
            {
                "section_title": "Health Screenings and Hygiene Practices",
                "section_text": "Daily self-checks are encouraged for all staff and students before arriving at school.\n\nRandom temperature checks may be conducted at entry points during heightened risk periods.\n\nHandwashing Protocol:\n- Wash hands with soap and water for a minimum of 20 seconds\n- Use hand sanitizer (60%+ alcohol) when soap is unavailable\n- Wash before eating, after using the bathroom, and after coughing/sneezing\n\nCough and Sneeze Etiquette: Cover mouth and nose with a tissue or elbow. Dispose of tissues immediately. Wash hands afterward."
            },
            {
                "section_title": "Cleaning and Disinfection Procedures",
                "section_text": "High-touch surfaces (doorknobs, light switches, desks, handrails, shared equipment) must be cleaned and disinfected daily.\n\nDeep cleaning of affected areas is mandatory after any confirmed illness cases.\n\nClassrooms, washrooms, and common areas follow a scheduled cleaning rotation. Additional cleaning may be ordered by the Health & Safety Officer during outbreaks."
            },
            {
                "section_title": "Social Distancing and Masks",
                "section_text": "Physical distancing should be maintained where possible, especially in common areas such as the canteen, corridors, and assembly halls.\n\nMask usage follows current public health guidance. During heightened risk periods, the school may require masks in indoor settings.\n\nAll staff and students are expected to follow posted distancing guidelines and cooperate with any temporary arrangements."
            },
            {
                "section_title": "Vaccinations and Documentation",
                "section_text": "Vaccination against common transmissible diseases is strongly encouraged for all students and staff.\n\nDepending on public health directives, proof of vaccination may be requested for enrollment or continued attendance.\n\nThe school maintains confidential vaccination records as part of student and staff health files."
            },
            {
                "section_title": "Pandemic Response Plan",
                "section_text": "The Head of Health & Safety continuously monitors health advisories and relays updates to school leadership.\n\nColor-Coded Risk Scenarios:\n\nGREEN — Limited, scattered cases. Enhanced monitoring. Standard hygiene measures enforced.\n\nYELLOW — Local human-to-human spread in small clusters. Increased vigilance. Possible schedule reorganization. Strict hygiene and PPE enforcement.\n\nRED — Major local or global outbreaks. Emergency measures activated. Possible school closure or remote learning. Full PPE required. Isolation protocols enforced."
            },
            {
                "section_title": "Response Measures and Reentry",
                "section_text": "During any active risk scenario, the school will:\n- Communicate current status and risks to all stakeholders\n- Secure necessary supplies and support resources\n- Enforce isolation for symptomatic individuals\n- Reorganize schedules to minimize contact\n- Enforce hygiene protocols and PPE usage\n\nReentry and Reintegration:\n- Medical clearance is required before returning after illness\n- Returning individuals will be monitored for recurring symptoms\n- The school will coordinate with local health authorities for guidance\n- Emotional support and learning accommodations will be provided to returning students"
            }
        ]
    },
    {
        "id": MODULE_IDS["threat_response"],
        "title": "Threat Response (Bomb/Armed/Air Strike)",
        "description": "Bomb threat procedures, armed attack lockdown protocols, harmful substance response, and communication guidelines.",
        "order": 3,
        "icon": "ShieldAlert",
        "content": [
            {
                "section_title": "Bomb Threat Protocol",
                "section_text": "If a bomb threat is received (by phone, email, or any other means):\n\n1. Use the Appendix A Guiding Questions to gather as much information as possible from the caller\n2. Note: caller's exact words, speech characteristics, background noise, timing details, and location claims\n3. Notify the Head of Health & Safety and Principal immediately\n4. The Principal coordinates with police and the Ministry of Education (MOESY)\n\nCRITICAL: Do NOT use fire alarms for evacuation during a bomb threat. Use loudhailer or Telegram messaging to announce evacuation.\n\nAvoid mobile phone or radio use near any suspected devices — these can trigger accidental detonation within 30 metres."
            },
            {
                "section_title": "Bomb Threat Evacuation",
                "section_text": "Evacuation Destination: The seaside area opposite Glaros Fish Tavern, maintaining a 300-metre radius from the school.\n\nCRITICAL RULE: Leave all doors and windows OPEN during evacuation. This minimizes blast impact and aids ventilation.\n\nEvacuation must avoid all areas near the suspected threat. Use alternative routes as directed by the Health & Safety Lead.\n\nStudents must be kept calm and informed only of necessary information. All communication with external parties must be approved by the Principal."
            },
            {
                "section_title": "Suspicious Object Protocol",
                "section_text": "If a suspicious object is found on school premises:\n\n- Do NOT touch, move, or approach the object\n- Maintain a minimum radius of 300 metres around the object\n- Evacuate the area immediately\n- Notify the Head of Health & Safety and Principal\n- Avoid ALL entry to the area until cleared by the police bomb squad\n- Do not use mobile phones or radio equipment within 30 metres of the suspected device\n\nThe police bomb squad has sole authority to declare an area safe."
            },
            {
                "section_title": "Armed Attack Protocol",
                "section_text": "If an armed individual is reported on or near school premises:\n\n1. Inform the Head of Health & Safety and Principal IMMEDIATELY\n2. Initiate LOCKDOWN procedures\n3. Notify police (112) with all available critical information:\n   - Number of attackers\n   - Type of weapon(s)\n   - Location and direction of movement\n   - Physical description\n\nDo NOT engage with the attacker under any circumstances.\nMove AWAY from the attacker's known location if possible."
            },
            {
                "section_title": "Lockdown Procedures",
                "section_text": "During a lockdown:\n\n1. LOCK all doors immediately\n2. CLOSE all windows and blinds\n3. Turn off lights\n4. Keep everyone SILENT — no talking, no phones ringing\n5. Move away from doors and windows\n6. Stay low, out of line of sight\n7. Do not open doors for anyone until the all-clear is given by police or the Health & Safety Lead\n\nSilent Communication: If possible, use text messages to communicate with police. Do not make voice calls that could reveal your location.\n\nThe lockdown remains in effect until officially lifted by law enforcement."
            },
            {
                "section_title": "Harmful Substance Threat",
                "section_text": "If a harmful substance threat is received or suspected contamination is detected:\n\n1. Gather information using Appendix A guiding questions (if by phone/communication)\n2. Notify the Head of Health & Safety and Principal immediately\n\nIf Contamination is Suspected in Closed Spaces:\n- Evacuate individuals from the room immediately\n- Close doors and windows to contain the substance\n- Do NOT touch any potentially contaminated items\n\nIf Contamination is Suspected in Open Spaces or Airborne:\n- Move to well-ventilated areas\n- Position yourself UPWIND from the suspected source\n- Cover nose and mouth if possible\n\nWait for emergency services and follow their decontamination instructions."
            },
            {
                "section_title": "Air Strike/External Military Threat",
                "section_text": "In the event of an air strike warning or external military threat:\n\n1. Move immediately to interior rooms, away from windows and exterior walls\n2. Stay LOW — below window level\n3. Follow emergency broadcast instructions if available\n4. The Health & Safety Lead will coordinate response based on the nature of the threat\n\nIf the threat involves aerial bombardment:\n- Seek shelter in the most structurally reinforced areas of the building\n- Avoid top floors and glass-heavy areas\n- Remain in shelter until an official all-clear is given\n\nCommunications Manager (Elena Pyzirevitch) manages all external communication during such events."
            },
            {
                "section_title": "Appendix A: Bomb Threat Communication Form",
                "section_text": "When receiving a threat call, document the following:\n\nExact Words Used: Write down the caller's exact words verbatim.\n\nQuestions to Ask:\n- When is the bomb going to explode?\n- Where is it right now?\n- What does it look like?\n- What kind of bomb is it?\n- What will cause it to explode?\n- Did you place the bomb? Why?\n- What is your name?\n- Where are you calling from?\n\nCaller's Voice Characteristics: Calm, angry, excited, slow, rapid, soft, loud, accented, familiar?\n\nBackground Sounds: Street noise, music, voices, machinery, quiet, other?\n\nThreat Language: Well-spoken, incoherent, taped message, read message, irrational?\n\nNote the exact time of the call, its duration, and the number displayed (if any)."
            }
        ]
    },
    {
        "id": MODULE_IDS["mental_health"],
        "title": "Mental Health & Aftermath",
        "description": "Psychological support during and after incidents, specialist referrals, and preventative measures for vulnerable students.",
        "order": 4,
        "icon": "Brain",
        "content": [
            {
                "section_title": "Support During Incidents",
                "section_text": "During any emergency or critical incident, immediate psychological support is essential:\n\nCrisis Management and Emotional Support:\n- Ensure all safety protocols are being followed first\n- Provide basic needs: food, water, blankets\n- Assign dedicated staff members to monitor and support visibly distressed students\n- Use calm, reassuring language\n- Do not force students to talk about what happened\n\nConfidentiality and Controlled Communication:\n- Share ONLY verified information with students and staff\n- All communication must be approved by the Head of Health & Safety or Principal\n- Avoid speculation and rumours\n- Designate a single spokesperson for external communication"
            },
            {
                "section_title": "Support for Vulnerable Students",
                "section_text": "Special attention must be given to students who may be more severely affected:\n\n- Students with pre-existing mental health conditions\n- Students who have experienced prior trauma\n- Students with special educational needs\n- Students with limited family support systems\n- Students who directly witnessed the incident\n\nFor these students:\n- Provide one-on-one comfort and supervision\n- Ensure they are not left alone\n- Monitor their reactions closely\n- Communicate with their parents/guardians as soon as possible\n- Consider early release to parents if appropriate"
            },
            {
                "section_title": "Post-Incident Safety and Reassurance",
                "section_text": "After any incident, the following steps are critical:\n\n1. Physical Safety: Inspect all premises before allowing students to return. Ensure the building is structurally safe.\n\n2. Communication: Inform parents and staff about:\n   - What happened (verified facts only)\n   - What safety measures are now in place\n   - What support is available\n   - How to access additional help\n\n3. Reaffirm Security: Demonstrate visible safety measures. Reassure students and staff that the school is safe.\n\n4. Environment: Maintain familiar routines as much as possible. Routines provide stability and a sense of normalcy."
            },
            {
                "section_title": "Emotional Care and Monitoring",
                "section_text": "Creating a Supportive Environment:\n- Allow students to share their feelings in a safe space\n- Do not force discussions, but make opportunities available\n- For younger students, use comforting gestures (gentle tone, familiar activities)\n- For older students, acknowledge their feelings and validate their experiences\n\nOngoing Monitoring:\n- Observe student behavior in the days and weeks following an incident\n- Watch for changes in:\n  - Academic performance\n  - Social interactions\n  - Eating and sleeping patterns\n  - Emotional regulation\n  - Attendance\n\n- Reinforce normal school rules to maintain structure and predictability"
            },
            {
                "section_title": "Long-Term Psychological Support",
                "section_text": "Observation and Response:\n- Continue monitoring students for weeks and months after an incident\n- Be alert for signs of ongoing distress or developing conditions such as PTSD\n\nKey indicators that professional help may be needed:\n- Persistent emotional outbursts or crying episodes\n- Significant decline in academic performance\n- Social withdrawal or isolation\n- Aggressive or disruptive behavior\n- Regression (younger children reverting to earlier behaviors)\n- Nightmares or sleep disturbances\n- Physical complaints without medical cause (headaches, stomachaches)\n- Expressions of hopelessness or self-harm ideation"
            },
            {
                "section_title": "Referral to Specialists",
                "section_text": "When to Refer:\nIf any of the indicators listed persist beyond 2-3 weeks, or if they are severe from the outset, a referral to mental health specialists is recommended.\n\nChild and Adolescent Mental Health Services (CAMHS)\nContact Number: 22284700\n\nParents should be informed and supported in making the referral. They can also contact CAMHS directly.\n\nThe school counselor (if available) can serve as a bridge between the school and external mental health services.\n\nAll referral information is treated with strict confidentiality."
            },
            {
                "section_title": "Preventative Measures and Skill Building",
                "section_text": "Emergency Preparedness Training:\n- Conduct regular drills for all types of emergencies\n- Include role-specific actions in training scenarios\n- Debrief after each drill to address concerns and improve response\n\nBuilding Coping Skills and Resilience:\n- Promote activities that build confidence and problem-solving abilities\n- Teach emotional regulation techniques\n- Introduce mindfulness and relaxation exercises\n- Encourage peer support and buddy systems\n\nOngoing Engagement:\n- Staff should regularly check in with students, especially those identified as vulnerable\n- Create classroom activities that promote discussion about safety and feelings\n- Encourage students to report concerns to trusted adults"
            },
            {
                "section_title": "Mental Health Crisis Protocol",
                "section_text": "If a student is experiencing a mental health crisis (severe distress, panic attack, or self-harm risk):\n\n1. Move the student to a quiet, private space\n2. Stay with them — do NOT leave them alone\n3. Use calm, reassuring language\n4. Listen without judgment\n5. Do not promise secrecy if there is a risk of harm\n\nIf there is an immediate risk of self-harm:\n- Call 112 immediately\n- Keep the student safe until emergency services arrive\n- Remove any objects that could be used for self-harm\n- Inform the Principal and Health & Safety Lead\n\nAfter the crisis:\n- Contact parents/guardians\n- Document the incident\n- Arrange follow-up support\n- Consider referral to CAMHS (22284700)"
            }
        ]
    },
    {
        "id": MODULE_IDS["first_aid"],
        "title": "First Aid & Medical Chain",
        "description": "DRABC framework, chain of medical responsibility, emergency protocols, and when to call 112.",
        "order": 5,
        "icon": "Stethoscope",
        "content": [
            {
                "section_title": "Chain of Medical Responsibility",
                "section_text": "Main School Programme (07:30 - 16:00):\nThe School Doctor, Dr. Christoforos Drousiotis, is the Primary Medical Responder (PMR). ALL medical emergencies during school hours must be reported to Dr. Drousiotis first.\n\nIf the School Doctor is absent or off-site before 16:00:\nThe First Aid Team is activated. Reception contacts the next available team member.\n\nDesignated First Aid Team (Before 16:00):\n- Kosmas Ourkeroglou (Primary PE Teacher)\n- Marat Khakimov\n- Kristina Magomedova\n- Anna Hancharova\n\nExtracurricular Programme (16:00 - 18:00):\nThe School Doctor remains the responder if still on-site. If not, management falls to the First Aid Team and Head of EXTRA (Karina Demidenko).\n\nDesignated First Aid Team (After 16:00):\n- Marat Khakimov\n- Tatiana Bakova\n- Hanna Hancharova\n- Karina Demidenko\n- Daria Kulikova"
            },
            {
                "section_title": "The DRABC Framework",
                "section_text": "The DRABC framework is the universal first aid assessment procedure. Follow these steps IN ORDER:\n\nD — DANGER\nCheck for danger to yourself, bystanders, and the casualty. Do not become a second victim.\n\nR — RESPONSE\nCheck if the casualty is responsive. Gently shake their shoulders and ask loudly: \"Are you okay?\"\n\nA — AIRWAY\nIf unresponsive, open the airway by tilting the head back and lifting the chin.\n\nB — BREATHING\nLook, listen, and feel for breathing for up to 10 seconds. Look for chest movement, listen for breath sounds, feel for air on your cheek.\n\nC — CIRCULATION\nCheck for signs of circulation: breathing, coughing, movement. If there is no breathing and no signs of circulation, begin CPR if trained and call 112 immediately."
            },
            {
                "section_title": "General Staff Rules for Medical Emergencies",
                "section_text": "Every staff member must follow these rules during any medical emergency:\n\n1. NEVER leave an injured or ill student unsupervised\n2. Do NOT give food, drink, or medication to the student\n3. Remove bystanders from the area — maintain the student's privacy and dignity\n4. Stay CALM — your demeanor affects the student's stress level\n5. Provide clear, factual information to first responders\n6. Call Reception to activate the medical chain\n7. Do NOT attempt medical treatment unless you are trained and authorized\n\nTeachers and Activity Leaders:\n- Provide initial supervision and comfort\n- Never leave the child alone\n- Must NOT provide medical treatment unless certified\n- Must call Reception immediately for all injuries"
            },
            {
                "section_title": "When to Call 112 Immediately",
                "section_text": "Call 112 (Emergency Services) WITHOUT DELAY for any of the following:\n\n- Difficulty breathing or choking\n- Severe or uncontrolled bleeding\n- Seizure lasting more than 5 minutes\n- Unresponsive student (not waking up)\n- Suspected spinal or neck injury\n- Anaphylaxis (severe allergic reaction)\n- Snake bite\n- Severe asthma attack not responding to inhaler\n- Signs of poisoning or chemical exposure\n- Mental health crisis with self-harm risk\n\nDo not wait for the School Doctor if any of these conditions are present. Every second counts.\n\nReception staff serve as the central communication hub — they call the School Doctor for life-threatening incidents, contact parents after instruction, and activate the first aid team."
            },
            {
                "section_title": "Scenario Protocols: Bleeding, Fractures, Head Injuries",
                "section_text": "A. Severe Bleeding / Open Wounds:\n- Apply firm, direct pressure with a clean cloth or dressing\n- Elevate the injured limb if possible\n- Call the School Doctor immediately\n- Call 112 if bleeding is arterial (spurting, bright red)\n\nB. Suspected Fracture / Spinal Injury:\n- Do NOT move the child\n- Immobilize the injured area\n- Call 112 for any suspected spinal, neck, or open fractures\n- Keep the student calm and still\n\nC. Head Injury / Concussion:\n- Observe the student closely for at least 30 minutes\n- No return to sports on the same day\n- Call 112 immediately if the student experiences: vomiting, loss of consciousness, confusion, unequal pupils, or worsening headache"
            },
            {
                "section_title": "Scenario Protocols: Asthma, Anaphylaxis, Seizures",
                "section_text": "D. Asthma Attack:\n- Help the student sit upright (do not lay them down)\n- Assist them in using their own inhaler\n- Encourage slow, steady breathing\n- Call 112 if there is no improvement after 2 puffs or if breathing worsens\n\nE. Allergic Reaction / Anaphylaxis:\n- Administer EpiPen or Anapen if you are trained and authorized\n- Lay the student flat (unless breathing is difficult — then sit them up)\n- ALWAYS call 112 for anaphylaxis, even if the EpiPen appears to work\n- Do not leave the student alone\n\nF. Seizures:\n- Do NOT restrain the student\n- Protect their head (place something soft underneath)\n- Time the seizure\n- Call 112 if the seizure lasts more than 5 minutes\n- After the seizure, place in the recovery position"
            },
            {
                "section_title": "Scenario Protocols: Burns, Choking, Diabetes, Other",
                "section_text": "G. Diabetic Emergencies:\n- Follow the student's individual care plan\n- If conscious and low blood sugar suspected: give sugar (juice, glucose tablet)\n- Call 112 if unconscious or confused\n\nH. Choking:\n- Encourage coughing first\n- If trained: perform back blows and abdominal thrusts\n- Call 112 if the obstruction is not resolved quickly\n\nI. Burns / Scalds:\n- Cool the burn under running water for 20 minutes\n- Do NOT apply ice, butter, or creams\n- Call 112 for large burns, facial burns, or if the child is an infant\n\nJ. Nosebleeds: Lean forward, pinch soft part of nose, call 112 if bleeding >30 minutes\n\nK. Fainting: Lay flat, elevate legs, call 112 if breathing is abnormal\n\nL. Poisoning: Move away from substance, do NOT induce vomiting, call 112 immediately\n\nM. Animal/Snake Bite: Keep still, immobilize, call 112 immediately"
            },
            {
                "section_title": "First Aid Equipment and Communication",
                "section_text": "First Aid Equipment Locations:\n- Main First Aid Room (ground floor, near reception)\n- Mobile First Aid Kits: Assembly hall, Science room\n- AED (Automated External Defibrillator): Reception area\n\nAll first aid kits are checked and restocked monthly by the Health & Safety Lead.\n\nCommunication Protocol:\n- Parents are contacted AFTER the initial medical assessment by the School Doctor or First Aid Team\n- The Principal is informed immediately for any serious or life-threatening cases\n- 112 can be activated by the School Doctor, First Aid Team, or any staff member in a life-threatening emergency — do not wait for authorization\n\nDocumentation:\n- An Incident Form must be completed for every medical event\n- Severe injuries require an additional Severe Injury Report\n- Parents must acknowledge receipt of incident information"
            }
        ]
    },
    {
        "id": MODULE_IDS["security_handover"],
        "title": "Security & Handover",
        "description": "Security guard protocols, daily 16:00 handover procedure, transfer of responsibility, and contingency measures.",
        "order": 6,
        "icon": "Shield",
        "content": [
            {
                "section_title": "Security Guard Behavior and Expectations",
                "section_text": "All security personnel must maintain the highest standards of professional conduct:\n\nCommunication:\n- Professional tone at all times\n- Respectful communication with students, staff, parents, and visitors\n- De-escalation techniques must be used when encountering conflict\n\nPhysical Contact:\n- Physical contact with students is limited strictly to safety situations\n- No unnecessary physical interaction\n- All interactions must be appropriate and documented if physical intervention is required\n\nAppearance:\n- Full uniform must be worn at all times\n- Professional grooming standards maintained\n- ID badge visible at all times\n\nSexual Harassment Prevention:\n- Zero tolerance policy\n- All staff trained on appropriate boundaries\n- Reporting mechanisms available and clearly communicated"
            },
            {
                "section_title": "Guard Responsibilities",
                "section_text": "Monitoring Entrances and Exits:\n- Strict access control for all entry points\n- Visitor identification and sign-in procedures\n- Monitoring for unauthorized access attempts\n- Surveillance system oversight\n- Ensure all visitors have proper identification and sign-in\n\nPatrolling Internal and External Areas:\n- Routine patrols at scheduled intervals\n- Focus on high-risk areas (perimeter, isolated areas, parking zones)\n- Maintain visibility to deter potential threats\n- Report any anomalies immediately\n\nAssisting with Safety Drills:\n- Active participation in all drill types\n- Coordination with the Health & Safety Lead\n- Assist with crowd management and route guidance during evacuations"
            },
            {
                "section_title": "Incident Reporting",
                "section_text": "Types of Reportable Incidents:\n- Accidents and injuries\n- Suspicious behavior or persons\n- Unauthorized entry or access attempts\n- Disturbances or confrontations\n- Equipment damage or safety hazards\n- Any other security concerns\n\nReporting Process:\n1. IMMEDIATE: Communicate the incident to the Health & Safety Lead or Principal verbally or by phone\n2. WRITTEN REPORT: Complete a formal written incident report\n3. SUBMISSION: Submit the report before end of shift\n4. FOLLOW-UP: Cooperate with any investigation\n\nAll reports must include: date, time, location, persons involved, description of the incident, actions taken, and witnesses."
            },
            {
                "section_title": "Emergency Protocols for Security Guards",
                "section_text": "Fire Protocols:\n- Assist with evacuation and ensure fire exits remain clear\n- Guide students, staff, and visitors to designated assembly areas\n- Prevent re-entry into the building\n\nMedical Emergencies:\n- Assist first responders by clearing pathways\n- Open gates for ambulance access\n- Guide emergency vehicles to the correct entrance\n- Maintain perimeter security during the emergency\n\nLockdown Protocols:\n- Secure all entry and exit points\n- Prevent anyone from entering or leaving the secured area\n- Communicate with police upon their arrival\n\nActive Threat Situations:\n- Follow the armed attack protocol\n- Do NOT attempt to confront the threat\n- Coordinate with law enforcement\n- Assist with evacuation if directed by police"
            },
            {
                "section_title": "Student Interaction Rules",
                "section_text": "Security guards must maintain professional boundaries at all times when interacting with students:\n\n- Maintain formality — do not develop personal relationships\n- No unnecessary conversations beyond security duties\n- Physical contact is permitted ONLY in genuine safety situations\n- All interactions should be observable by other staff\n- Report any student behavior concerns to appropriate school staff (teachers, Head of Year, or Principal)\n- Do NOT discipline students — this is the responsibility of teaching staff\n\nHandling Student Behavior Issues:\n- If a student is breaking rules: Observe and report to the nearest teacher\n- If a student is in danger: Intervene for safety, then report\n- If a student reports a concern to you: Listen, reassure, and immediately inform a teacher or the Principal"
            },
            {
                "section_title": "Daily 16:00 Handover Procedure",
                "section_text": "The daily 16:00 handover is a MANDATORY procedure that must be completed every school day.\n\nMethod: Google Form submission\nFrom: Health & Safety Lead (Dr. Christoforos Drousiotis)\nTo: Head of EXTRA / Extra Coordinator\n\nThe handover must confirm:\n1. Staff Status: Who is present, who has left, any staffing issues\n2. Access Control: Status of all entry/exit points, any visitor or access concerns\n3. Medical Status: Any ongoing medical situations, students in the medical room, pending parent pickups\n4. Risks: Any identified or potential risks for the evening session\n5. Important Student Information: Students with behavioral concerns, pending parent communications, any special circumstances\n\nThe handover is logged and can be audited. Failure to complete the handover is a protocol violation."
            },
            {
                "section_title": "Transfer of Responsibility",
                "section_text": "At 16:00, formal responsibility transfers:\n\nFROM: Health & Safety Lead (Dr. Christoforos Drousiotis)\nTO: Head of EXTRA / Evening Security Personnel\n\nAfter the transfer:\n- The Head of EXTRA assumes full operational responsibility\n- The H&S Lead is NOT required on-site unless:\n  - Extended duty has been pre-approved\n  - An active incident is ongoing\n  - Management has specifically requested their presence\n\nExtended Working Hours:\n- Must be pre-approved and justified\n- Communicated to school management in advance\n- All extended hours are recorded and documented\n\nThe evening team has full authority to activate emergency protocols if needed."
            },
            {
                "section_title": "Contingency Procedures",
                "section_text": "Absence or Delay of Security Personnel:\n\nNotification: The security guard must inform the Health & Safety Lead by 7:20 AM if they will be absent or delayed. The H&S Lead then informs relevant staff.\n\nTemporary Morning Coverage (Security Absent):\n- The morning cleaner opens the gate and places the sign-in register\n- The morning cleaner must NOT escort visitors or manage visitor access\n- All visitors are directed to the Front Desk\n- No unauthorized movement is permitted\n\nIf the Morning Cleaner is Also Absent:\n- The Health & Safety Lead may unlock the premises personally\n\nOngoing Monitoring:\n- The H&S Lead continuously monitors the situation\n- Coordinates with the security company for replacement\n- Documents all absences and delays\n\nAll contingency activations are recorded, reported to management, and reviewed for pattern analysis."
            }
        ]
    },
]

ROLE_QUESTIONS = {
    "Teachers": [
        {
            "question": "The continuous warning bell sounds during class. What should you do FIRST?",
            "options": ["Run to the nearest exit", "Have students line up quietly by the classroom door", "Call the Principal", "Wait for further instructions on your phone"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "After exiting the building during a fire drill, what is your primary responsibility at the assembly point?",
            "options": ["Call parents immediately", "Take a headcount or call the register", "Search for missing students inside", "Dismiss students to go home"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "An earthquake begins while you are teaching. What is the FIRST action you and your students should take?",
            "options": ["Evacuate immediately", "Call 112", "Drop, Cover, and Hold On", "Open all windows"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "Primary classrooms are the 'Immediate Evacuation Group' during earthquakes. How do they receive the evacuation signal?",
            "options": ["Fire alarm", "Text message", "Pagers", "Loudspeaker announcement"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "A student has been absent with flu symptoms. How long must they be symptom-free before returning to school?",
            "options": ["12 hours", "24 hours without medication", "48 hours", "Until they feel better"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["health_diseases"]
        },
        {
            "question": "A bomb threat has been received. Where is the designated evacuation point?",
            "options": ["The school car park", "The nearest park", "The seaside opposite Glaros Fish Tavern (300m radius)", "The adjacent school grounds"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "An armed intruder alert is announced. You are in your classroom with students. What must you do?",
            "options": ["Evacuate through the nearest exit", "Lock the door, close blinds, and remain silent", "Confront the intruder", "Send students home immediately"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "Weeks after a safety incident, a student shows persistent emotional outbursts and social withdrawal. What is the recommended action?",
            "options": ["Ignore it as normal adjustment", "Punish the disruptive behavior", "Refer to CAMHS (22284700) for specialist support", "Tell the student to toughen up"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["mental_health"]
        },
        {
            "question": "A student collapses in your classroom and is unresponsive. Before providing help, what assessment framework should you follow?",
            "options": ["ABC", "DRABC", "CPR", "FAST"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "During a winter fire evacuation, a student wants to collect their coat from the classroom. What should you tell them?",
            "options": ["Go quickly and get it", "Coats are not needed in an emergency; blankets will be provided", "Send another student to get it", "Let them go back after the headcount"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        }
    ],
    "Security Guards": [
        {
            "question": "At what time is the daily handover procedure mandatory?",
            "options": ["15:00", "16:00", "17:00", "End of school day varies"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        },
        {
            "question": "What tool/method is used for the daily 16:00 handover?",
            "options": ["Email to the Principal", "Google Form submission", "Verbal briefing only", "Written note in the security booth"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        },
        {
            "question": "You notice an unauthorized person attempting to enter the school premises. What is your correct action?",
            "options": ["Physically restrain them immediately", "Deny entry, report to H&S Lead, and monitor", "Let them in and ask questions later", "Call the police first without informing school staff"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        },
        {
            "question": "A suspicious package is found near the school entrance. What minimum radius must be maintained around it?",
            "options": ["50 metres", "100 metres", "200 metres", "300 metres"],
            "correct_answer": 3,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "Why must mobile phones NOT be used near a suspected explosive device?",
            "options": ["They interfere with police radios", "They could trigger accidental detonation", "They drain battery too quickly", "They create panic among students"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "During a fire evacuation, what is your specific role as a security guard?",
            "options": ["Lead classroom evacuations", "Assist evacuation and ensure fire exits remain clear", "Fight the fire", "Call parents of students"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "An active armed threat is reported on campus. What is the correct lockdown action?",
            "options": ["Chase the attacker", "Secure all entry/exit points and prevent movement", "Evacuate everyone through the main gate", "Announce on loudspeaker for everyone to leave"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "You are absent and cannot report for duty. By what time must you inform the Health & Safety Lead?",
            "options": ["6:00 AM", "7:20 AM", "8:00 AM", "Before school starts"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        },
        {
            "question": "An ambulance is arriving for an injured student. What do you do?",
            "options": ["Direct them to park in the street", "Open gates and guide the ambulance to the correct entrance", "Tell them to wait until you find the Principal", "Block the gate until you verify their identity"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "You witness a student altercation during break time. What is the correct procedure?",
            "options": ["Physically separate the students yourself", "Observe, ensure safety, and report to the nearest teacher", "Ignore it as it's not your responsibility", "Discipline the students directly"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        }
    ],
    "Kitchen Staff": [
        {
            "question": "During a fire evacuation from the canteen, which exit should kitchen staff use?",
            "options": ["The canteen front fire exit", "The rear exit to the rear assembly point", "The main school entrance", "Any available exit"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "Students in the canteen during a fire alarm should be led by teachers to which assembly point?",
            "options": ["Rear assembly point", "Front assembly point via canteen fire exit", "Back of the sports hall", "The car park"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "How frequently must high-touch surfaces in the kitchen and canteen be cleaned?",
            "options": ["Weekly", "Every other day", "Daily", "Only after confirmed illness"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["health_diseases"]
        },
        {
            "question": "What is the minimum duration recommended for handwashing?",
            "options": ["5 seconds", "10 seconds", "20 seconds", "30 seconds"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["health_diseases"]
        },
        {
            "question": "In the pandemic response plan, a RED color-coded scenario indicates what?",
            "options": ["Limited scattered cases", "Local spread in small clusters", "Major local or global outbreaks", "All clear, no cases"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["health_diseases"]
        },
        {
            "question": "You are in the canteen kitchen when an earthquake strikes. What do you do FIRST?",
            "options": ["Run outside immediately", "Turn off all kitchen equipment", "Drop, Cover, and Hold On", "Call the fire department"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "During a bomb threat evacuation, should doors and windows be left open or closed?",
            "options": ["Closed and locked", "Open to minimize blast impact", "It doesn't matter", "Only windows closed, doors open"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "A student in the canteen appears to be choking. As kitchen staff without first aid training, what should you do?",
            "options": ["Perform the Heimlich maneuver immediately", "Call Reception to activate the medical chain", "Give them water to drink", "Pat them on the back and hope for the best"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A kitchen staff member develops a fever and cough. What should they do?",
            "options": ["Continue working with a mask", "Stay home and notify their supervisor and H&S Officer", "Take medication and return to work", "Ask a colleague to cover and leave quietly"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["health_diseases"]
        },
        {
            "question": "An armed attack lockdown is initiated while you are in the canteen. What is your immediate action?",
            "options": ["Evacuate through the kitchen exit", "Lock doors, close blinds, stay silent, move away from windows", "Continue serving food to keep students calm", "Call 112 from the kitchen phone"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        }
    ],
    "Extra-Curricular Staff": [
        {
            "question": "Who assumes primary responsibility for health and safety after the 16:00 handover?",
            "options": ["The Principal", "Head of EXTRA / Evening Security", "The last teacher to leave", "No one — it's automatic"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        },
        {
            "question": "During after-school activities, who is responsible for fire evacuation and attendance?",
            "options": ["The security guard", "The supervising teacher using club registers", "The school administrator", "Parents who are on-site"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "Which register must be used during an after-school fire evacuation?",
            "options": ["Main class register", "Club registers", "A new emergency register", "No register needed after school"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "An earthquake occurs at 17:00 during your after-school activity. What do you do FIRST?",
            "options": ["Evacuate immediately", "Call the Health & Safety Lead", "Drop, Cover, and Hold On, then evacuate when shaking stops", "Send students to their parents"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "After 16:00, the School Doctor has left. Who manages medical emergencies?",
            "options": ["The Principal from home", "The PM First Aid Team and Head of EXTRA", "Only 112 services", "Kitchen staff"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A student has a severe asthma attack during after-school drama club. What should you do?",
            "options": ["Tell them to breathe slowly and rest", "Help them sit upright, assist with their inhaler, call 112 if no improvement", "Give them water and send them home", "Wait for the attack to pass naturally"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "During a bomb threat, which communication method should NOT be used for evacuation announcements?",
            "options": ["Loudhailer", "Telegram messaging", "The fire alarm", "Direct verbal instruction"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "A student in your after-school club shows signs of needing mental health support. What is the CAMHS contact number for specialist referrals?",
            "options": ["112", "22284700", "199", "22800800"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["mental_health"]
        },
        {
            "question": "An armed individual is reported near the school during your after-school session. What is your first action?",
            "options": ["Evacuate all students outside", "Lockdown: Lock doors, close blinds, remain silent", "Call parents to pick up students", "Investigate the report yourself"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "A visitor arrives during after-school hours without any identification. What do you do?",
            "options": ["Let them in if they seem trustworthy", "Direct them to the Front Desk; no unsupervised access", "Ask them to wait outside until tomorrow", "Escort them to wherever they want to go"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        }
    ],
    "Reception Staff": [
        {
            "question": "A life-threatening medical emergency occurs during school hours. Who do you call FIRST?",
            "options": ["Parents", "112 emergency services", "The School Doctor (Dr. Drousiotis)", "The Principal"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "After the School Doctor assesses a student's injury and gives instructions, who should Reception contact next?",
            "options": ["The media", "The student's parents", "Other students in the class", "The Ministry of Education"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "During a fire evacuation, what item must the school administrator bring to the assembly point?",
            "options": ["First aid kits", "Class registers for all classes", "The school laptop", "Student lunch boxes"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["fire_earthquake"]
        },
        {
            "question": "Where is the AED (Automated External Defibrillator) located in the school?",
            "options": ["Sports hall", "First aid room", "Reception area", "Principal's office"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "You receive a bomb threat phone call at Reception. What document should you use to gather information from the caller?",
            "options": ["Incident report form", "Appendix A: Bomb Threat Communication Form", "Student registration form", "Daily handover form"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "During an armed attack, how should evacuation announcements be made?",
            "options": ["Fire alarm", "Loudhailer or Telegram (NOT the fire alarm)", "School intercom", "Send emails to all staff"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["threat_response"]
        },
        {
            "question": "A parent calls to report their child has been diagnosed with a transmissible disease. What is your next step?",
            "options": ["Announce it to the school", "Notify the supervisor and Health & Safety Officer", "Post it on the school website", "Tell the child's classmates"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["health_diseases"]
        },
        {
            "question": "Which of these conditions requires calling 112 IMMEDIATELY without waiting for the School Doctor?",
            "options": ["A minor cut on the finger", "A student with a headache", "Difficulty breathing, severe bleeding, seizure >5 min, or unresponsive student", "A student feeling nauseous"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "In the pandemic response plan, what color code indicates local human-to-human spread in small clusters?",
            "options": ["Green", "Yellow", "Red", "Orange"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["health_diseases"]
        },
        {
            "question": "What information must be confirmed during the 16:00 daily handover?",
            "options": ["Only student attendance numbers", "Staff status, access control, medical status, risks, and student information", "Just the security guard's shift hours", "Only pending parent communications"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["security_handover"]
        }
    ],
    "First Aid Team": [
        {
            "question": "In the DRABC assessment framework, what does the 'D' stand for?",
            "options": ["Defibrillator", "Danger", "Diagnosis", "Duration"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "After checking for Danger and Response in DRABC, what do you check next?",
            "options": ["Breathing", "Circulation", "Airway", "Call for help"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A student has been seizing for 6 minutes. What should you do?",
            "options": ["Put something in their mouth", "Restrain them firmly", "Call 112 immediately (seizure exceeds 5 minutes)", "Pour water on their face"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A student shows signs of anaphylaxis (severe allergic reaction). What is the FIRST medical action?",
            "options": ["Give them antihistamine tablets", "Administer EpiPen/Anapen if trained and authorized", "Have them drink water", "Apply a cold compress"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A student has arterial bleeding (spurting bright red blood). After applying direct pressure, what is the immediate priority?",
            "options": ["Apply a tourniquet", "Call 112 immediately", "Clean the wound", "Apply antiseptic cream"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A student has fallen from the climbing frame and you suspect a spinal injury. What must you NOT do?",
            "options": ["Call for help", "Keep them calm", "Move the child", "Monitor their breathing"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A student has a burn on their arm. How long should you cool it under running water?",
            "options": ["5 minutes", "10 minutes", "20 minutes", "Until the pain stops"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "According to protocol, what should you NEVER give to an injured student?",
            "options": ["A blanket", "Reassurance", "Food, drink, or medication", "First aid attention"],
            "correct_answer": 2,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "A student hit their head during PE and is now vomiting. Should they return to activities?",
            "options": ["Yes, if they say they feel fine", "No — call 112 immediately for vomiting after a head injury", "Yes, after resting for 30 minutes", "Only if a teacher approves"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        },
        {
            "question": "Who is the Primary Medical Responder (PMR) at I CAN SCHOOL until 16:00?",
            "options": ["The school nurse", "Dr. Christoforos Drousiotis", "Any available teacher", "The Head of EXTRA"],
            "correct_answer": 1,
            "related_module_id": MODULE_IDS["first_aid"]
        }
    ]
}

DEFAULT_PATHS = [
    {
        "id": "path-teachers",
        "name": "Teachers Safety Certification",
        "description": "Comprehensive health and safety training for all teaching staff, covering fire evacuation, earthquake response, classroom safety, and student welfare.",
        "target_role": "Teachers",
        "module_ids": [MODULE_IDS["fire_earthquake"], MODULE_IDS["health_diseases"], MODULE_IDS["threat_response"], MODULE_IDS["mental_health"], MODULE_IDS["first_aid"], MODULE_IDS["security_handover"]],
        "certificate_expiry_days": 365,
    },
    {
        "id": "path-security",
        "name": "Security Guards Safety Certification",
        "description": "Specialized security training focused on handover protocols, access control, threat response, and emergency coordination.",
        "target_role": "Security Guards",
        "module_ids": [MODULE_IDS["security_handover"], MODULE_IDS["threat_response"], MODULE_IDS["fire_earthquake"], MODULE_IDS["first_aid"], MODULE_IDS["health_diseases"], MODULE_IDS["mental_health"]],
        "certificate_expiry_days": 365,
    },
    {
        "id": "path-kitchen",
        "name": "Kitchen Staff Safety Certification",
        "description": "Safety training for kitchen and canteen staff covering fire safety, hygiene protocols, disease prevention, and emergency evacuation.",
        "target_role": "Kitchen Staff",
        "module_ids": [MODULE_IDS["health_diseases"], MODULE_IDS["fire_earthquake"], MODULE_IDS["first_aid"], MODULE_IDS["threat_response"], MODULE_IDS["mental_health"], MODULE_IDS["security_handover"]],
        "certificate_expiry_days": 365,
    },
    {
        "id": "path-extra",
        "name": "Extra-Curricular Staff Safety Certification",
        "description": "After-school safety training covering handover procedures, emergency response during activities, and medical emergency protocols.",
        "target_role": "Extra-Curricular Staff",
        "module_ids": [MODULE_IDS["security_handover"], MODULE_IDS["fire_earthquake"], MODULE_IDS["first_aid"], MODULE_IDS["threat_response"], MODULE_IDS["mental_health"], MODULE_IDS["health_diseases"]],
        "certificate_expiry_days": 365,
    },
    {
        "id": "path-reception",
        "name": "Reception Staff Safety Certification",
        "description": "Training for reception staff focused on communication chains, emergency coordination, medical response activation, and visitor management.",
        "target_role": "Reception Staff",
        "module_ids": [MODULE_IDS["first_aid"], MODULE_IDS["fire_earthquake"], MODULE_IDS["threat_response"], MODULE_IDS["health_diseases"], MODULE_IDS["security_handover"], MODULE_IDS["mental_health"]],
        "certificate_expiry_days": 365,
    },
    {
        "id": "path-firstaid",
        "name": "First Aid Team Safety Certification",
        "description": "Advanced first aid training covering DRABC framework, scenario-based emergency protocols, and medical chain of responsibility.",
        "target_role": "First Aid Team",
        "module_ids": [MODULE_IDS["first_aid"], MODULE_IDS["fire_earthquake"], MODULE_IDS["health_diseases"], MODULE_IDS["threat_response"], MODULE_IDS["mental_health"], MODULE_IDS["security_handover"]],
        "certificate_expiry_days": 365,
    },
]

RESOURCES = [
    {
        "id": "res-001",
        "title": "Emergency Contact Numbers",
        "category": "emergency",
        "icon": "Phone",
        "content": "Emergency Services: 112\nCAMHS (Mental Health): 22284700\nMinistry of Education (MOESY): Contact via Principal\n\nSchool Doctor: Dr. Christoforos Drousiotis (until 16:00)\nCommunications Manager: Elena Pyzirevitch\nHead of EXTRA: Karina Demidenko"
    },
    {
        "id": "res-002",
        "title": "Appendix A: Bomb Threat Communication Form",
        "category": "forms",
        "icon": "FileText",
        "content": "BOMB THREAT COMMUNICATION FORM\n\nDate: ___________  Time of Call: ___________  Duration: ___________\nNumber Displayed: ___________\n\nEXACT WORDS OF THREAT:\n_________________________________________________\n\nQUESTIONS TO ASK:\n1. When is the bomb going to explode?\n2. Where is it right now?\n3. What does it look like?\n4. What kind of bomb is it?\n5. What will cause it to explode?\n6. Did you place the bomb? Why?\n7. What is your name?\n8. Where are you calling from?\n\nCALLER'S VOICE:\n[ ] Calm  [ ] Angry  [ ] Excited  [ ] Slow  [ ] Rapid\n[ ] Soft  [ ] Loud  [ ] Accented  [ ] Familiar\n\nBACKGROUND SOUNDS:\n[ ] Street noise  [ ] Music  [ ] Voices  [ ] Machinery  [ ] Quiet\n\nTHREAT LANGUAGE:\n[ ] Well-spoken  [ ] Incoherent  [ ] Taped  [ ] Read  [ ] Irrational\n\nReceived by: ___________  Position: ___________"
    },
    {
        "id": "res-003",
        "title": "DRABC Quick Reference Card",
        "category": "medical",
        "icon": "HeartPulse",
        "content": "DRABC FRAMEWORK - Quick Reference\n\nD - DANGER: Check for danger to yourself, bystanders, and casualty\nR - RESPONSE: Gently shake shoulders, ask 'Are you okay?'\nA - AIRWAY: Tilt head back, lift chin to open airway\nB - BREATHING: Look, listen, feel for 10 seconds\nC - CIRCULATION: Check for signs of life; if none, begin CPR and call 112\n\nWHEN TO CALL 112:\n- Difficulty breathing / Choking\n- Severe bleeding\n- Seizure > 5 minutes\n- Unresponsive person\n- Suspected spinal/neck injury\n- Anaphylaxis\n- Snake bite\n- Severe asthma attack"
    },
    {
        "id": "res-004",
        "title": "Assembly Points Reference",
        "category": "evacuation",
        "icon": "MapPin",
        "content": "FIRE ASSEMBLY POINTS:\n- Front Assembly Point: Front of school building\n- Rear Assembly Point: Back of school building\n- Critical Incident: Further away as directed by Headteacher\n\nEARTHQUAKE ASSEMBLY:\n- Areas far from buildings, walls, windows, trees, and wires\n\nBOMB THREAT EVACUATION:\n- Seaside opposite Glaros Fish Tavern (300m radius from school)\n\nROUTES BY LOCATION:\n- Primary (Ground): Back door → Rear assembly\n- Year 2B/3: Front door → End of corridor → Rear assembly\n- Canteen Students: Front fire exit → Front assembly\n- Kitchen Staff: Rear exit → Rear assembly\n- First Floor: Main stairs / Sports hall → Back right exit\n- Second Floor: Ground floor → Staff entrance → Back assembly"
    },
    {
        "id": "res-005",
        "title": "Daily 16:00 Handover Checklist",
        "category": "operations",
        "icon": "ClipboardCheck",
        "content": "DAILY 16:00 HANDOVER CHECKLIST\n\nFrom: Health & Safety Lead\nTo: Head of EXTRA / Extra Coordinator\nMethod: Google Form\n\nCONFIRM THE FOLLOWING:\n\n1. STAFF STATUS:\n   [ ] Who is present for evening session\n   [ ] Who has left the building\n   [ ] Any staffing issues or shortages\n\n2. ACCESS CONTROL:\n   [ ] Status of all entry/exit points\n   [ ] Any visitor or access concerns\n   [ ] Perimeter status\n\n3. MEDICAL STATUS:\n   [ ] Any ongoing medical situations\n   [ ] Students in the medical room\n   [ ] Pending parent pickups\n\n4. RISKS:\n   [ ] Any identified risks for evening session\n   [ ] Weather concerns\n   [ ] Maintenance issues\n\n5. STUDENT INFORMATION:\n   [ ] Behavioral concerns to be aware of\n   [ ] Pending parent communications\n   [ ] Special circumstances"
    },
    {
        "id": "res-006",
        "title": "First Aid Team Contact List",
        "category": "medical",
        "icon": "Users",
        "content": "FIRST AID TEAM CONTACTS\n\nPRIMARY MEDICAL RESPONDER:\nDr. Christoforos Drousiotis (School Doctor) - Until 16:00\n\nFIRST AID TEAM (Before 16:00):\n- Kosmas Ourkeroglou (Primary PE Teacher)\n- Marat Khakimov\n- Kristina Magomedova\n- Anna Hancharova\n\nFIRST AID TEAM (After 16:00):\n- Marat Khakimov\n- Tatiana Bakova\n- Hanna Hancharova\n- Karina Demidenko\n- Daria Kulikova\n\nFIRE WARDEN TEAM:\n- Ilia Shumilin\n- Kosmas Ourkeroglou\n- Maxim Vlasov\n- Elena Puzirevich\n- Dr. Christoforos Drousiotis\n- Ekaterina Shipilova\n\nAED LOCATION: Reception Area"
    }
]

async def seed_database(db):
    existing_admin = await db.users.find_one({"email": "admin@icanschool.com"})
    if existing_admin:
        return

    now = datetime.now(timezone.utc).isoformat()

    admin_user = {
        "id": ADMIN_ID,
        "email": "admin@icanschool.com",
        "password_hash": hash_pw("admin123"),
        "name": "Dr. Christoforos Drousiotis",
        "role": "admin",
        "staff_category": "",
        "assigned_path_id": None,
        "created_at": now,
        "is_active": True
    }
    await db.users.insert_one(admin_user)

    for mod in MODULES:
        mod_doc = {**mod, "created_at": now}
        await db.modules.insert_one(mod_doc)

    for path in DEFAULT_PATHS:
        path_doc = {**path, "created_at": now, "created_by": ADMIN_ID}
        await db.learning_paths.insert_one(path_doc)

    for role, questions in ROLE_QUESTIONS.items():
        q_doc = {
            "id": f"q-{role.lower().replace(' ', '-')}",
            "target_role": role,
            "questions": questions,
            "created_at": now
        }
        await db.questions.insert_one(q_doc)

    for res in RESOURCES:
        res_doc = {**res, "created_at": now}
        await db.resources.insert_one(res_doc)

    sample_staff = [
        {"name": "Julia Lepine", "email": "julia@icanschool.com", "category": "Teachers"},
        {"name": "Kosmas Ourkeroglou", "email": "kosmas@icanschool.com", "category": "First Aid Team"},
        {"name": "Marat Khakimov", "email": "marat@icanschool.com", "category": "Security Guards"},
        {"name": "Daria Kulikova", "email": "daria@icanschool.com", "category": "Extra-Curricular Staff"},
        {"name": "Marina Banks", "email": "marina@icanschool.com", "category": "Reception Staff"},
        {"name": "Elena Puzirevich", "email": "elena@icanschool.com", "category": "Kitchen Staff"},
    ]

    role_to_path = {p["target_role"]: p["id"] for p in DEFAULT_PATHS}

    for s in sample_staff:
        staff_doc = {
            "id": _id(),
            "email": s["email"],
            "password_hash": hash_pw("staff123"),
            "name": s["name"],
            "role": "staff",
            "staff_category": s["category"],
            "assigned_path_id": role_to_path.get(s["category"]),
            "created_at": now,
            "is_active": True
        }
        await db.users.insert_one(staff_doc)
