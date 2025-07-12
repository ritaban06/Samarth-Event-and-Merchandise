import React from "react";
import '../grad.css';

import ab from '../images/Pravidhi_AB.webp';
import pm from '../images/Pravidhi_PM.webp';
import sd from '../images/Pravidhi_SD.webp';
import ks from '../images/Pravidhi_KS.webp';
import rs from '../images/Pravidhi_RG.webp';
import ar from '../images/Pravidhi_AR.webp';
import arc from '../images/Pravidhi_ARC.webp';
import db from '../images/Pravidhi_DB.webp';
import sda from '../images/Pravidhi_SDas.webp';
import sm from '../images/Pravidhi_SM.webp';
import ss from '../images/Pravidhi_SS.webp';
import sdutta from '../images/Pravidhi_SDutta.webp';


const Team = () => {
  return (
    <section className="pb-10 pt-20 dark:bg-dark lg:pb-20 lg:pt-[120px]">
      <div className="container mx-auto">
        <div className="-mx-4 flex flex-wrap">
          <div className="w-full px-4">
            <div className="mx-auto mb-[60px] max-w-[510px] text-center">
              <span className="mb-2 block text-lg font-semibold text-primary">
                Team Pravidhi
              </span>
              <h2 className="mb-3 text-3xl font-bold leading-[1.2] gradient-text sm:text-4xl md:text-[40px]">
              🚀 Meet The Team!</h2>
              <p className="text-base text-body-color dark:text-dark-6">
              A group of talented individuals driving innovation and creating solutions with creativity. Together, they are working tirelessly to bring excellence to life.
              </p>
            </div>
          </div>
        </div>

        <div className="-mx-4 flex flex-wrap justify-center">
          <TeamCard
            name="Anirban Bandyopadhyay"
            profession="Pravidhi Lead, 2nd Year TMSL"
            imageSrc={ ab }
          />
          <TeamCard
            name="Priyobrata Mondal"
            profession="Pravidhi Lead, 2nd Year TMSL"
            imageSrc={ pm }
          />
          
          <TeamCard
            name="Sujay Dey"
            profession="Pravidhi Lead, 2nd Year TMSL"
            imageSrc={ sd }
          />
          <TeamCard
            name="Koustav Singh"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ ks }
          />

          <TeamCard
            name="Ritaban Ghosh"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ rs }
          />

          <TeamCard
            name="Sougata Mondal"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ sm }
          />

          <TeamCard
            name="Anjali Ray"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ ar }
          />

          <TeamCard
            name="Anirban Roy Chowdhury"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ arc }
          />

          <TeamCard
            name="Sampad Das"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ sda }
          />

          <TeamCard
            name="Soumyajeet Samajdar"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ ss }
          />

          <TeamCard
            name="Sayantan Dutta"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ sdutta }
          />

          <TeamCard
            name="Debjyoti Bose"
            profession="Team Pravidhi, 1st Year TMSL"
            imageSrc={ db }
          />
        </div>
      </div>
    </section>
  );
};

export default Team;

const TeamCard = ({ imageSrc, name, profession }) => {
  return (
    <>
      <div className="w-full px-4 md:w-1/2 xl:w-1/4">
        <div className="mx-auto mb-10 w-72 max-w-[370px]">
          <div className="relative overflow-hidden rounded-lg">
            <img loading="lazy" src={imageSrc} alt="" className="w-full" />
            <div className="absolute bottom-5 left-0 w-full text-center">
              <div className="relative mx-5 overflow-hidden rounded-lg bg-gradient-to-br from-blue-950 to-slate-900 px-3 py-5 dark:bg-dark-2">
                <h3 className="text-base font-semibold text-dark dark:text-yellow-400">
                  {name}
                </h3>
                <p className="text-xs text-body-color dark:text-dark-6">
                  {profession}
                </p>
                <div>
                  <span className="absolute bottom-0 left-0">
                    <svg
                      width={61}
                      height={30}
                      viewBox="0 0 61 30"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx={16}
                        cy={45}
                        r={45}
                        fill="#13C296"
                        fillOpacity="0.11"
                      />
                    </svg>
                  </span>
                  <span className="absolute right-0 top-0">
                    <svg
                      width={20}
                      height={25}
                      viewBox="0 0 20 25"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="0.706257"
                        cy="24.3533"
                        r="0.646687"
                        transform="rotate(-90 0.706257 24.3533)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="6.39669"
                        cy="24.3533"
                        r="0.646687"
                        transform="rotate(-90 6.39669 24.3533)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="12.0881"
                        cy="24.3533"
                        r="0.646687"
                        transform="rotate(-90 12.0881 24.3533)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="17.7785"
                        cy="24.3533"
                        r="0.646687"
                        transform="rotate(-90 17.7785 24.3533)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="0.706257"
                        cy="18.6624"
                        r="0.646687"
                        transform="rotate(-90 0.706257 18.6624)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="6.39669"
                        cy="18.6624"
                        r="0.646687"
                        transform="rotate(-90 6.39669 18.6624)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="12.0881"
                        cy="18.6624"
                        r="0.646687"
                        transform="rotate(-90 12.0881 18.6624)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="17.7785"
                        cy="18.6624"
                        r="0.646687"
                        transform="rotate(-90 17.7785 18.6624)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="0.706257"
                        cy="12.9717"
                        r="0.646687"
                        transform="rotate(-90 0.706257 12.9717)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="6.39669"
                        cy="12.9717"
                        r="0.646687"
                        transform="rotate(-90 6.39669 12.9717)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="12.0881"
                        cy="12.9717"
                        r="0.646687"
                        transform="rotate(-90 12.0881 12.9717)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="17.7785"
                        cy="12.9717"
                        r="0.646687"
                        transform="rotate(-90 17.7785 12.9717)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="0.706257"
                        cy="7.28077"
                        r="0.646687"
                        transform="rotate(-90 0.706257 7.28077)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="6.39669"
                        cy="7.28077"
                        r="0.646687"
                        transform="rotate(-90 6.39669 7.28077)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="12.0881"
                        cy="7.28077"
                        r="0.646687"
                        transform="rotate(-90 12.0881 7.28077)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="17.7785"
                        cy="7.28077"
                        r="0.646687"
                        transform="rotate(-90 17.7785 7.28077)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="0.706257"
                        cy="1.58989"
                        r="0.646687"
                        transform="rotate(-90 0.706257 1.58989)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="6.39669"
                        cy="1.58989"
                        r="0.646687"
                        transform="rotate(-90 6.39669 1.58989)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="12.0881"
                        cy="1.58989"
                        r="0.646687"
                        transform="rotate(-90 12.0881 1.58989)"
                        fill="#3056D3"
                      />
                      <circle
                        cx="17.7785"
                        cy="1.58989"
                        r="0.646687"
                        transform="rotate(-90 17.7785 1.58989)"
                        fill="#3056D3"
                      />
                    </svg>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
